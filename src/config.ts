import { WebhookTriggers } from './models/webhook';
import ExpressBinding from './server-bindings/express-binding';

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

export type AuthenticateUrlConfig = {
  redirectURI: string;
  redirectOnError?: boolean;
  loginHint?: string;
  state?: string;
  provider?: string;
  scopes?: string[];
};

export enum Region {
  Us = 'us',
  Canada = 'canada',
  Ireland = 'ireland',
  Australia = 'australia',
  Staging = 'staging',
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
  [Region.Canada]: {
    nylasAPIUrl: 'https://canada.api.nylas.com',
    dashboardApiUrl: 'https://canada.dashboard.nylas.com',
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
  [Region.Australia]: {
    nylasAPIUrl: 'https://australia.api.nylas.com',
    dashboardApiUrl: 'https://australia.dashboard.nylas.com',
    callbackDomain: 'cb.nylas.com',
    websocketDomain: 'tunnel.nylas.com',
    telemetryApiUrl: 'https://cli.nylas.com',
  },
  [Region.Staging]: {
    nylasAPIUrl: 'https://api-staging.nylas.com',
    dashboardApiUrl: 'https://staging-dashboard.nylas.com',
    callbackDomain: 'cb.nylas.com',
    websocketDomain: 'tunnel.nylas.com',
    telemetryApiUrl: 'https://cli.nylas.com',
  },
};

export const DEFAULT_WEBHOOK_TRIGGERS = Object.values(WebhookTriggers);

export const ServerBindings = {
  express: ExpressBinding,
};
