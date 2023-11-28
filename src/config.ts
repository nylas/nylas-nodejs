import { WebhookTriggers } from './models/webhook';
import LoggingInterface from './models/LoggingInterface';

export let apiServer: string | null = null;
export function setApiServer(newApiServer: string | null) {
  apiServer = newApiServer;
}

export let clientSecret = '';
export function setClientSecret(newClientSecret: string) {
  clientSecret = newClientSecret;
}

export let timeout = 0;
export function setTimeout(newTimeout: number) {
  timeout = newTimeout;
}

export let logger: LoggingInterface | undefined = undefined;
export function setLogger(newLogger?: LoggingInterface) {
  logger = newLogger;
}

export type NylasConfig = {
  /** Nylas application client ID */
  clientId: string;
  /** Nylas application client secret */
  clientSecret: string;
  /** API Server base URL */
  apiServer?: string;
  /** Timeout for outgoing API calls, in milliseconds */
  timeout?: number;
  /** Logger to redirect log messages to your application. */
  logger?: LoggingInterface;
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
