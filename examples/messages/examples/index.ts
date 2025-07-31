import { sendFilePathAttachments } from './file-path-attachments';
import { sendStreamAttachments } from './stream-attachments';
import { sendBufferAttachments } from './buffer-attachments';
import { sendStringAttachments } from './string-attachments';
import { sendAttachmentsByFormat } from './flexible-attachments';

export type SendAttachmentsExamples = {
  sendFilePathAttachments: typeof sendFilePathAttachments,
  sendStreamAttachments: typeof sendStreamAttachments,
  sendBufferAttachments: typeof sendBufferAttachments,
  sendStringAttachments: typeof sendStringAttachments,
  sendAttachmentsByFormat: typeof sendAttachmentsByFormat
};