import { RedirectUri } from './redirectUri.js';

/**
 * Interface for a Nylas application details object
 */
export interface ApplicationDetails {
  /**
   * Public Application ID
   */
  applicationId: string;
  /**
   * ID of organization
   */
  organizationId: string;
  /**
   * Region identifier (e.g. `us`, `eu`). Free-form string, not a closed enum.
   */
  region: string;
  /**
   * Environment identifier (e.g. `sandbox`). Free-form string, not a closed enum.
   */
  environment: string;
  /**
   * White-label domain. Omitted when empty.
   */
  domain?: string;
  /**
   * Branding details for the application
   */
  branding: Branding;
  /**
   * Hosted authentication branding details
   */
  hostedAuthentication?: HostedAuthentication;
  /**
   * Identity provider (IdP) settings for the application
   */
  idpSettings?: IdpSettings;
  /**
   * List of callback (redirect) URIs.
   *
   * Read-only on the application object; manage entries via the dedicated
   * redirect-uris endpoints (`Nylas.applications.redirectUris`).
   */
  callbackUris?: RedirectUri[];
  /**
   * Unix timestamp (seconds) when the application was created. Omitted when empty.
   */
  createdAt?: number;
  /**
   * Unix timestamp (seconds) when the application was last updated. Omitted when empty.
   */
  updatedAt?: number;
  /**
   * Whether the application is blocked. Omitted when empty.
   */
  blocked?: boolean;
}

/**
 * Interface for branding details for the application
 */
export interface Branding {
  /**
   * Name of the application
   */
  name: string;
  /**
   * URL points to application icon
   */
  iconUrl?: string;
  /**
   * Application / publisher website URL
   */
  websiteUrl?: string;
  /**
   * Description of the application
   */
  description?: string;
}

/**
 * Interface for hosted authentication branding details
 */
export interface HostedAuthentication {
  /**
   * URL of the background image
   */
  backgroundImageUrl?: string;
  /**
   * Alignment of background image
   */
  alignment?: string;
  /**
   * Primary color
   */
  colorPrimary?: string;
  /**
   * Secondary color
   */
  colorSecondary?: string;
  /**
   * Title
   */
  title?: string;
  /**
   * Subtitle
   */
  subtitle?: string;
  /**
   * Background color
   */
  backgroundColor?: string;
  /**
   * CSS spacing attribute in px
   */
  spacing?: number;
  /**
   * URL of the terms of service
   */
  termsOfServiceUrl?: string;
  /**
   * URL of the privacy policy
   */
  privacyPolicyUrl?: string;
}

/**
 * Interface for identity provider (IdP) settings for the application
 */
export interface IdpSettings {
  /**
   * Comma-separated list of allowed origins. Each must be an absolute HTTPS URL
   * (HTTP allowed for `localhost`/`127.0.0.1`) with no path, query, fragment, or userinfo.
   */
  origins?: string;
  /**
   * Comma-separated list of allowed issuers.
   */
  issuers?: string;
}

/**
 * Interface for additional settings for the application.
 *
 * Write-only on update: these values can be set via `PATCH /v3/applications` but are
 * stripped from every response, so they are not exposed on {@link ApplicationDetails}.
 */
export interface AdditionalSettings {
  /**
   * Login URL.
   */
  loginUrl?: string;
  /**
   * Logout URL.
   */
  logoutUrl?: string;
  /**
   * Absolute refresh-token expiration, in seconds.
   */
  refreshTokenExpirationAbsolute?: number;
  /**
   * Idle refresh-token expiration, in seconds.
   */
  refreshTokenExpirationIdle?: number;
  /**
   * Whether to rotate the refresh token on use.
   */
  rotateRefreshToken?: boolean;
  /**
   * Whether to allow query parameters in redirect URIs.
   */
  allowQueryParamInRedirectUri?: boolean;
}

/**
 * Branding details accepted on the application update path.
 *
 * Unlike the response {@link Branding} type, `name` is optional here — the source does
 * not require `branding.name` on `PATCH /v3/applications`.
 */
export type UpdateBranding = Partial<Branding>;

/**
 * Interface representing a request to update application details.
 *
 * All fields are optional; each supplied nested object is a full replace, not a deep merge.
 * Note: `callbackUris`/`redirectUris` are ignored by this endpoint — manage callback URIs
 * via the dedicated redirect-uris endpoints.
 */
export interface UpdateApplicationRequest {
  /**
   * Branding details for the application.
   */
  branding?: UpdateBranding;
  /**
   * Hosted authentication branding details.
   */
  hostedAuthentication?: HostedAuthentication;
  /**
   * Identity provider (IdP) settings for the application.
   */
  idpSettings?: IdpSettings;
  /**
   * White-label domain for the application.
   */
  domain?: string;
  /**
   * Additional settings for the application.
   *
   * Write-only: persisted on update but stripped from the response.
   */
  additionalSettings?: AdditionalSettings;
}
