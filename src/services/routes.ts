import { Scope } from '../models/connect';
import Nylas from '../nylas';
import AccessToken from '../models/access-token';

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

  return { buildAuthUrl, exchangeCodeForToken };
};

export default Routes;
