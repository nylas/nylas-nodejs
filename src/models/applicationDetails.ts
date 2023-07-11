import { RedirectUri } from './redirectUri';

export interface ApplicationDetails {
  applicationId: string;
  organizationId: string;
  region: 'us' | 'eu';
  environment: 'production' | 'staging';
  branding: Branding;
  hostedAuthentication?: HostedAuthentication;
  redirectUris?: RedirectUri[];
}

interface Branding {
  name: string;
  iconUrl?: string;
  websiteUrl?: string;
  description?: string;
}

interface HostedAuthentication {
  backgroundImageUrl?: string;
  alignment?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  spacing?: number;
}
