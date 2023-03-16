import { WebhookTriggers } from './models/webhook';

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
  apiKey: string;
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
  Ireland = 'ireland',
}

export const DEFAULT_REGION = Region.Us;

export const regionConfig = {
  [Region.Us]: {
    nylasAPIUrl: 'https://api.nylas.com',
    dashboardApiUrl: 'https://dashboard-api.nylas.com',
    callbackDomain: 'cb.nylas.com',
    websocketDomain: 'tunnel.nylas.com',
    telemetryApiUrl: 'https://cli.nylas.com',
  },
  [Region.Ireland]: {
    nylasAPIUrl: 'https://ireland.api.nylas.com',
    dashboardApiUrl: 'https://ireland.dashboard.nylas.com',
    callbackDomain: 'cb.nylas.com',
    websocketDomain: 'tunnel.nylas.com',
    telemetryApiUrl: 'https://cli.nylas.com',
  },
};

export const DEFAULT_WEBHOOK_TRIGGERS = Object.values(WebhookTriggers);
