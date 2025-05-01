/**
 * Configuration options for initializing the Nylas SDK.
 * @property apiKey The Nylas API key to use for authentication
 * @property apiUri The URL to use for communicating with the Nylas API
 * @property timeout The timeout for requests to the Nylas API, in seconds
 * @property headers Additional headers to send with outgoing requests
 */
export type NylasConfig = {
  apiKey: string;
  apiUri?: string;
  timeout?: number;
  headers?: Record<string, string>;
};

/**
 * The options that can override the default Nylas API client configuration.
 */
export type OverridableNylasConfig = {
  apiKey?: string;
  apiUri?: string;
  /**
   * @deprecated Providing timeout in milliseconds is deprecated and will be removed in the next major release. Please use seconds instead.
   */
  timeout?: number;
  headers?: Record<string, string>;
};

/**
 * An object that can be used to override the default Nylas API client configuration on a per-request basis.
 * @property overrides Overrides to the default Nylas API client configuration
 */
export interface Overrides {
  overrides?: OverridableNylasConfig;
}

/**
 * Enum representing the available Nylas API regions.
 */
export enum Region {
  Us = 'us',
  Eu = 'eu',
}

/**
 * The default Nylas API region.
 * @default Region.Us
 */
export const DEFAULT_REGION = Region.Us;

/**
 * The configuration options for each Nylas API region.
 */
type RegionConfig = {
  nylasAPIUrl: string;
};

/**
 * The available preset configuration values for each Nylas API region.
 */
export const REGION_CONFIG: Record<Region, RegionConfig> = {
  [Region.Us]: {
    nylasAPIUrl: 'https://api.us.nylas.com',
  },
  [Region.Eu]: {
    nylasAPIUrl: 'https://api.eu.nylas.com',
  },
};

/**
 * The default Nylas API URL.
 * @default https://api.us.nylas.com
 */
export const DEFAULT_SERVER_URL = REGION_CONFIG[DEFAULT_REGION].nylasAPIUrl;
