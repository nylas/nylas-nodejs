export interface ProviderDetectParams {
  email: string;
  allProviderTypes?: boolean;
}

export interface ProviderDetectResponse {
  email_address: string;
  provider?: string;
  type?: string;
}

export interface Provider {
  name: string;
  provider: string;
  type: string;
  settings?: ProviderSettings;
}

interface ProviderSettings {
  name?: string;
  imap_host?: string;
  imap_port?: number;
  smtp_host?: string;
  smtp_port?: number;
  password_link?: string;
  primary?: boolean;
}
