import { Readable } from 'node:stream';
import APIClient from '../../src/apiClient';
import { SendMessageRequest } from '../../src/models/drafts';
import { Messages } from '../../src/resources/messages';
import { Drafts } from '../../src/resources/drafts';
import { TransactionalSend } from '../../src/resources/transactionalSend';
import { calculateTotalPayloadSize, objKeysToSnakeCase } from '../../src/utils';

describe('message JSON payload sizing', () => {
  it('counts the encoded content and attachment metadata in the JSON payload', () => {
    const content = Buffer.from('example');
    const requestBody = {
      to: [{ email: 'test@example.com' }],
      attachments: [
        { filename: 'résumé.txt', contentType: 'text/plain', content },
      ],
    };
    const serialized = JSON.stringify(
      objKeysToSnakeCase({
        ...requestBody,
        attachments: [
          {
            ...requestBody.attachments[0],
            content: content.toString('base64'),
          },
        ],
      })
    );

    expect(calculateTotalPayloadSize(requestBody)).toBe(
      Buffer.byteLength(serialized)
    );
  });

  const operations = [
    'send',
    'createDraft',
    'updateDraft',
    'transactional',
  ] as const;

  it.each(operations)(
    '%s uses multipart for a Buffer that expands beyond the JSON limit without a declared size',
    async (operation) => {
      const apiClient = new APIClient({
        apiKey: 'test',
        apiUri: 'https://api.us.nylas.com',
        timeout: 30,
        headers: {},
      });
      const request = jest.spyOn(apiClient, 'request').mockResolvedValue({});
      const requestBody: SendMessageRequest = {
        to: [{ email: 'test@example.com' }],
        attachments: [
          {
            filename: 'file.bin',
            contentType: 'application/octet-stream',
            content: Buffer.alloc(2.4 * 1024 * 1024),
          },
        ],
      };

      if (operation === 'send') {
        await new Messages(apiClient).send({
          identifier: 'grant',
          requestBody,
        });
      } else if (operation === 'createDraft') {
        await new Drafts(apiClient).create({
          identifier: 'grant',
          requestBody,
        });
      } else if (operation === 'updateDraft') {
        await new Drafts(apiClient).update({
          identifier: 'grant',
          draftId: 'draft',
          requestBody,
        });
      } else {
        await new TransactionalSend(apiClient).send({
          domainName: 'example.com',
          requestBody,
        });
      }

      expect(request.mock.calls[0][0].form).toBeDefined();
      expect(request.mock.calls[0][0].body).toBeUndefined();
    }
  );

  it('counts an already encoded base64 attachment without a declared size', () => {
    const encodedContent = Buffer.alloc(2.4 * 1024 * 1024).toString('base64');
    expect(
      calculateTotalPayloadSize({
        attachments: [
          {
            filename: 'file.bin',
            contentType: 'application/octet-stream',
            content: encodedContent,
          },
        ],
      })
    ).toBeGreaterThan(Messages.MAXIMUM_JSON_ATTACHMENT_SIZE);
  });

  it('includes base64 expansion for a stream with a declared size without reading it', () => {
    const content = Readable.from(['example']);
    expect(
      calculateTotalPayloadSize({
        attachments: [
          {
            filename: 'file.bin',
            contentType: 'application/octet-stream',
            content,
            size: 2.4 * 1024 * 1024,
          },
        ],
      })
    ).toBeGreaterThan(Messages.MAXIMUM_JSON_ATTACHMENT_SIZE);
    expect(content.readableDidRead).toBe(false);
  });
});
