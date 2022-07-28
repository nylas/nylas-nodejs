import { Scope } from '../models/connect';
import Nylas from '../nylas';
import AccessToken from '../models/access-token';
import crypto from 'crypto';

export enum DefaultRoutes {
  buildAuthUrl = '/generate-auth-url',
  exchangeCodeForToken = '/exchange-mailbox-token',
}

// Type aliases for the functions in Routes

export type BuildAuthUrl = (options: BuildAuthUrlOptions) => Promise<string>;

export type ExchangeCodeForToken = (code: string) => Promise<AccessToken>;

export type VerifyWebhookSignature = (
  nylasSignature: string,
  rawBody: Buffer
) => boolean;

export type BuildAuthUrlOptions = {
  scopes: Scope[];
  emailAddress: string;
  successUrl: string;
  clientUri?: string;
  state?: string;
};

type Routes = {
  buildAuthUrl: BuildAuthUrl;
  exchangeCodeForToken: ExchangeCodeForToken;
  verifyWebhookSignature: VerifyWebhookSignature;
};

export const Routes = (nylasClient: Nylas): Routes => {
  const buildAuthUrl = async (
    options: BuildAuthUrlOptions
  ): Promise<string> => {
    const { scopes, emailAddress, successUrl, clientUri, state } = options;

    return nylasClient.urlForAuthentication({
      loginHint: emailAddress,
      redirectURI: (clientUri || '') + successUrl,
      scopes,
      state,
    });
  };

  const exchangeCodeForToken = async (code: string): Promise<AccessToken> => {
    return await nylasClient.exchangeCodeForToken(code);
  };

  /**
   * Verify incoming webhook signature came from Nylas
   * @param nylasSignature The signature to verify
   * @param rawBody The raw body from the payload
   * @return true if the webhook signature was verified from Nylas
   */
  const verifyWebhookSignature = (
    nylasSignature: string,
    rawBody: Buffer
  ): boolean => {
    const digest = crypto
      .createHmac('sha256', nylasClient.clientSecret)
      .update(rawBody)
      .digest('hex');
    return digest === nylasSignature;
  };

  return { buildAuthUrl, exchangeCodeForToken, verifyWebhookSignature };
};

export default Routes;
