export interface CreateFileRequest {
  filename: string;
  contentType: string;
  content: string;
  size?: number;
  isInline?: boolean;
  contentId?: string;
  contentDisposition?: string;
}

export interface File extends CreateFileRequest {
  id: string;
  grantId: string;
}
