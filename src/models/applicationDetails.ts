import { RedirectUri } from './redirectUri';

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
   * Region identifier
   */
  region: 'us' | 'eu';
  /**
   * Environment identifier
   */
  environment: 'production' | 'staging';
  /**
   * Branding details for the application
   */
  branding: Branding;
  /**
   * Hosted authentication branding details
   */
  hostedAuthentication?: HostedAuthentication;
  /**
   * List of redirect URIs
   */
  redirectUris?: RedirectUri[];
}

/**
 * Interface for branding details for the application
 */
interface Branding {
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
   * Description of the appli∏cati∏on
   */
  description?: string;
}

/**
 * Interface for hosted authentication branding details
 */
interface HostedAuthentication {
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
}
