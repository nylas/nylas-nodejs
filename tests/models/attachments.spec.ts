import {
  Attachment,
  CreateAttachmentRequest,
} from '../../src/models/attachments';

describe('Attachment types', () => {
  it('allows returned attachment metadata without a filename', () => {
    const attachment: Attachment = {
      id: 'attachment-id',
      grantId: 'grant-id',
      contentType: 'message/delivery-status',
    };

    const filename: string | undefined = attachment.filename;
    expect(filename).toBeUndefined();
  });

  it('continues to require a filename for new attachments', () => {
    // @ts-expect-error Outgoing attachments still require a filename.
    const attachment: CreateAttachmentRequest = {
      contentType: 'text/plain',
      content: 'dGVzdA==',
    };

    expect(attachment.content).toBe('dGVzdA==');
  });
});
