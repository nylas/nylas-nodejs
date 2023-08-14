export interface ProviderDetectParams {
  email: string;
  allProviderTypes?: boolean;
}

export interface ProviderDetectResponse {
  emailAddress: string;
  detected: boolean;
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
  imapHost?: string;
  imapPort?: number;
  smtpHost?: string;
  smtpPort?: number;
  passwordLink?: string;
  primary?: boolean;
}
