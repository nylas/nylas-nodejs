export type RedirectUri = {
  id: string;
  url: string;
  platform: string;
  settings?: RedirectUriSettings;
};

export type RedirectUriSettings = {
  origin?: string;
  bundleId?: string;
  packageName?: string;
  sha1CertificateFingerprint?: string;
};

export type CreateRedirectUriRequest = {
  url: string;
  platform: string;
  settings?: RedirectUriSettings;
};

export type UpdateRedirectUriRequest = Partial<CreateRedirectUriRequest>;
