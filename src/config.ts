export let apiServer: string | null = null;
export function setApiServer(newApiServer: string | null) {
  apiServer = newApiServer;
}

export let clientSecret = '';
export function setClientSecret(newClientSecret: string) {
  clientSecret = newClientSecret;
}

export type NylasConfig = {
  clientId: string;
  clientSecret: string;
  apiServer?: string;
};

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

export const regionConfig: Record<Region, RegionConfig> = {
  [Region.Us]: {
    nylasAPIUrl: 'https://api.us.nylas.com',
  },
  [Region.Eu]: {
    nylasAPIUrl: 'https://api.eu.nylas.com',
  },
};
