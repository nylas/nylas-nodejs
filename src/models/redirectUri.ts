/**
 * Interface representation of a Redirect URI object
 */
export type RedirectUri = {
  /**
   * Globally unique object identifier
   */
  id: string;
  /**
   * Redirect URL
   */
  url: string;
  /**
   * Platform identifier
   */
  platform: string;
  /**
   * Configuration settings
   */
  settings?: RedirectUriSettings;
};

/**
 * Configuration settings for a Redirect URI object
 */
export type RedirectUriSettings = {
  /**
   * Related to JS platform
   */
  origin?: string;
  /**
   * Related to iOS platform
   */
  bundleId?: string;
  /**
   * Related to iOS platform
   */
  appStoreId?: string;
  /**
   * Related to iOS platform
   */
  teamId?: string;
  /**
   * Related to Android platform
   */
  packageName?: string;
  /**
   * Related to Android platform
   */
  sha1CertificateFingerprint?: string;
};

/**
 * Class representing a request to create a redirect uri.
 */
export type CreateRedirectUriRequest = {
  /**
   * Redirect URL.
   */
  url: string;
  /**
   * Platform identifier.
   */
  platform: string;
  /**
   * Optional settings for the redirect uri.
   */
  settings?: RedirectUriSettings;
};

/**
 * Interface representation of a Nylas update redirect uri request
 */
export type UpdateRedirectUriRequest = Partial<CreateRedirectUriRequest>;
