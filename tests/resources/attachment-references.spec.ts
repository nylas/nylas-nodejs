import APIClient from '../../src/apiClient';
import { AttachmentReference } from '../../src/models/attachments';
import { SendMessageRequest } from '../../src/models/drafts';
import { Drafts } from '../../src/resources/drafts';
import { Messages } from '../../src/resources/messages';
import { calculateTotalPayloadSize } from '../../src/utils';

describe('uploaded attachment references', () => {
  let apiClient: APIClient;
  let request: jest.SpiedFunction<APIClient['request']>;
  let messages: Messages;
  const reference: AttachmentReference = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    contentId: 'chart1',
  };

  beforeEach(() => {
    apiClient = new APIClient({
      apiKey: 'test',
      apiUri: 'https://api.us.nylas.com',
      timeout: 30,
      headers: {},
    });
    request = jest.spyOn(apiClient, 'request').mockResolvedValue({});
    messages = new Messages(apiClient);
  });

  it('accepts an ID-only reference and serializes it without file content or metadata', async () => {
    const requestBody: SendMessageRequest = {
      to: [{ email: 'test@example.com' }],
      body: '<img src="cid:chart1">',
      attachments: [reference],
    };

    await messages.send({ identifier: 'grant', requestBody });

    const { body } = apiClient.requestOptions(request.mock.calls[0][0]);
    const serialized = JSON.parse(body as string);
    expect(serialized.attachments).toEqual([
      { id: reference.id, content_id: 'chart1' },
    ]);
    expect(calculateTotalPayloadSize(requestBody)).toBe(
      Buffer.byteLength(body as string)
    );
    expect(requestBody.attachments).toEqual([reference]);
  });

  it('preserves references in the multipart JSON alongside binary attachments', async () => {
    const content = Buffer.alloc(Messages.MAXIMUM_JSON_ATTACHMENT_SIZE, 'a');
    await messages.send({
      identifier: 'grant',
      requestBody: {
        to: [{ email: 'test@example.com' }],
        body: '<img src="cid:chart1">',
        attachments: [
          reference,
          { filename: 'large.txt', contentType: 'text/plain', content },
        ],
      },
    });

    const form = request.mock.calls[0][0].form!;
    const message = JSON.parse(form.get('message') as string);
    expect(message.attachments).toEqual([
      { id: reference.id, content_id: 'chart1' },
    ]);
    expect(Array.from(form.keys())).toEqual(['message', 'file1']);
    const file = form.get('file1');
    expect(typeof file).toBe('object');
    if (file && typeof file !== 'string') {
      expect(file.name).toBe('large.txt');
      expect(Buffer.from(await file.arrayBuffer())).toEqual(content);
    }
  });

  it('preserves references when a large message body requires multipart', async () => {
    await messages.send({
      identifier: 'grant',
      requestBody: {
        to: [{ email: 'test@example.com' }],
        body: 'a'.repeat(Messages.MAXIMUM_JSON_ATTACHMENT_SIZE),
        attachments: [reference],
      },
    });

    const form = request.mock.calls[0][0].form!;
    expect(Array.from(form.keys())).toEqual(['message']);
    expect(JSON.parse(form.get('message') as string).attachments).toEqual([
      { id: reference.id, content_id: 'chart1' },
    ]);
  });

  it('accepts uploaded references when creating and updating drafts', async () => {
    const drafts = new Drafts(apiClient);
    await drafts.create({
      identifier: 'grant',
      requestBody: {
        to: [{ email: 'test@example.com' }],
        attachments: [reference],
      },
    });
    await drafts.update({
      identifier: 'grant',
      draftId: 'draft',
      requestBody: { attachments: [reference] },
    });

    for (const [options] of request.mock.calls) {
      const { body } = apiClient.requestOptions(options);
      expect(JSON.parse(body as string).attachments).toEqual([
        { id: reference.id, content_id: 'chart1' },
      ]);
    }
  });

  it.each([
    {},
    { id: '' },
    { id: '../attachment' },
    { id: 'a'.repeat(256) },
    { id: 'attachment', contentId: 'invalid\r\ncontent-id' },
    { id: 'attachment', filename: 'unexpected.txt' },
  ])(
    'rejects an invalid reference before making a request: %j',
    async (value) => {
      await expect(
        messages.send({
          identifier: 'grant',
          requestBody: {
            to: [{ email: 'test@example.com' }],
            attachments: [value as AttachmentReference],
          },
        })
      ).rejects.toThrow('Invalid attachment reference.');
      expect(request).not.toHaveBeenCalled();
    }
  );
});
