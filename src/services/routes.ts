import { Scope } from '../models/connect';
import Nylas from '../nylas';
import AccessToken from '../models/access-token';
import crypto from 'crypto';

export enum DefaultRoutes {
  buildAuthUrl = '/generate-auth-url',
  exchangeCodeForToken = '/exchange-mailbox-token',
}

export type BuildAuthUrlOptions = {
  scopes: Scope[];
  emailAddress: string;
  successUrl: string;
  clientUri?: string;
  state?: string;
};

type Routes = {
  buildAuthUrl: (
    nylasClient: Nylas,
    options: BuildAuthUrlOptions
  ) => Promise<string>;
  exchangeCodeForToken: (
    nylasClient: Nylas,
    code: string
  ) => Promise<AccessToken>;
  verifyWebhookSignature: (
    nylasClient: Nylas,
    nylasSignature: string,
    rawBody: Buffer
  ) => boolean;
};

export const Routes = (): Routes => {
  const buildAuthUrl = async (
    nylasClient: Nylas,
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

  const exchangeCodeForToken = async (
    nylasClient: Nylas,
    code: string
  ): Promise<AccessToken> => {
    return await nylasClient.exchangeCodeForToken(code);
  };

  /**
   * Verify incoming webhook signature came from Nylas
   * @param nylasSignature The signature to verify
   * @param rawBody The raw body from the payload
   * @return true if the webhook signature was verified from Nylas
   */
  const verifyWebhookSignature = (
    nylasClient: Nylas,
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
