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
