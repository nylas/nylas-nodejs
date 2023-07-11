export type NylasConfig = {
  apiKey: string;
  serverUrl?: string; // TODO: rename to nylasAPIUrl
  timeout?: number;
};

export type OverridableNylasConfig = Partial<NylasConfig>;

export interface Overrides {
  overrides?: OverridableNylasConfig;
}

export enum ResponseType {
  CODE = 'code',
  TOKEN = 'token',
}

export type AuthenticateUrlConfig = {
  redirectURI: string;
  redirectOnError?: boolean;
  loginHint?: string;
  state?: string;
  provider?: string;
  scopes?: string[];
  responseType?: ResponseType;
};

export enum Region {
  Us = 'us',
  Eu = 'eu',
}

export const DEFAULT_REGION = Region.Us;

type RegionConfig = {
  nylasAPIUrl: string;
};

export const REGION_CONFIG: Record<Region, RegionConfig> = {
  [Region.Us]: {
    nylasAPIUrl: 'https://api.us.nylas.com',
  },
  [Region.Eu]: {
    nylasAPIUrl: 'https://api.eu.nylas.com',
  },
};

export const DEFAULT_SERVER_URL = REGION_CONFIG[DEFAULT_REGION].nylasAPIUrl;
