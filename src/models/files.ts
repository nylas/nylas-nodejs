export interface File {
  id: string;
  grantId: string;
  filename?: string;
  size?: number;
  contentType?: string;
  isInline?: boolean;
  content?: string;
  contentId?: string;
  contentDisposition?: string;
}
