import { sendFilePathAttachments } from './file-path-attachments';
import { sendStreamAttachments } from './stream-attachments';
import { sendBufferAttachments } from './buffer-attachments';
import { sendStringAttachments } from './string-attachments';
import { sendAttachmentsByFormat } from './flexible-attachments';

export type SendAttachmentsExamples = {
  sendFilePathAttachments: (
    fileManager: Parameters<typeof sendFilePathAttachments>[0],
    recipientEmail: string,
    large?: boolean,
    isPlaintext?: boolean
  ) => ReturnType<typeof sendFilePathAttachments>;
  sendStreamAttachments: (
    fileManager: Parameters<typeof sendStreamAttachments>[0],
    recipientEmail: string,
    large?: boolean,
    isPlaintext?: boolean
  ) => ReturnType<typeof sendStreamAttachments>;
  sendBufferAttachments: (
    fileManager: Parameters<typeof sendBufferAttachments>[0],
    recipientEmail: string,
    large?: boolean,
    isPlaintext?: boolean
  ) => ReturnType<typeof sendBufferAttachments>;
  sendStringAttachments: (
    fileManager: Parameters<typeof sendStringAttachments>[0],
    recipientEmail: string,
    large?: boolean,
    isPlaintext?: boolean
  ) => ReturnType<typeof sendStringAttachments>;
  sendAttachmentsByFormat: (
    fileManager: Parameters<typeof sendAttachmentsByFormat>[0],
    format: Parameters<typeof sendAttachmentsByFormat>[1],
    recipientEmail: string,
    attachmentSize?: Parameters<typeof sendAttachmentsByFormat>[3],
    isPlaintext?: boolean
  ) => ReturnType<typeof sendAttachmentsByFormat>;
};
