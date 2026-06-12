/**
 * The platform of a Redirect URI.
 *
 * One of `web`, `js`, `ios`, `android`, or `desktop`. Defaults to `web` when omitted.
 */
export type RedirectUriPlatform = 'web' | 'js' | 'ios' | 'android' | 'desktop';

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
   * Platform identifier. One of `web`, `js`, `ios`, `android`, `desktop`.
   */
  platform: RedirectUriPlatform;
  /**
   * Configuration settings
   */
  settings?: RedirectUriSettings;
  /**
   * Unix timestamp (seconds) when the redirect URI was soft-deleted. Omitted when empty.
   */
  deletedAt?: number;
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
   * Platform identifier. One of `web`, `js`, `ios`, `android`, `desktop`.
   * Defaults to `web` when omitted.
   */
  platform?: RedirectUriPlatform;
  /**
   * Optional settings for the redirect uri.
   */
  settings?: RedirectUriSettings;
};

/**
 * Interface representation of a Nylas update redirect uri request
 */
export type UpdateRedirectUriRequest = Partial<CreateRedirectUriRequest>;
