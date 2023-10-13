interface BaseFile {
  filename: string;
  contentType: string;
  size?: number;
  isInline?: boolean;
  contentId?: string;
  contentDisposition?: string;
}

export interface CreateFileRequest extends BaseFile {
  content: NodeJS.ReadableStream;
}

export interface File extends BaseFile {
  id: string;
  grantId: string;
}
