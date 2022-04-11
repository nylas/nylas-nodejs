// TODO since node 10 URL is global
import { URL } from 'url';
import fetch from 'node-fetch';
import * as config from './config';
import NylasConnection, { RequestOptions } from './nylas-connection';
import ManagementAccount from './models/management-account';
import Account from './models/account';
import Connect from './models/connect';
import RestfulModelCollection from './models/restful-model-collection';
import ManagementModelCollection from './models/management-model-collection';
import Webhook from './models/webhook';
import { AuthenticateUrlConfig, NylasConfig } from './config';
import AccessToken from './models/access-token';
import ApplicationDetails, {
  ApplicationDetailsProperties,
} from './models/application-details';

class Nylas {
  static clientId = '';
  static get clientSecret(): string {
    return config.clientSecret;
  }
  static set clientSecret(newClientSecret: string) {
    config.setClientSecret(newClientSecret);
  }
  static get apiServer(): string | null {
    return config.apiServer;
  }
  static set apiServer(newApiServer: string | null) {
    config.setApiServer(newApiServer);
  }
  static accounts:
    | ManagementModelCollection<ManagementAccount>
    | RestfulModelCollection<Account>;
  static connect: Connect;
  static webhooks: ManagementModelCollection<Webhook>;

  static config(config: NylasConfig): Nylas {
    if (config.apiServer && config.apiServer.indexOf('://') === -1) {
      throw new Error(
        'Please specify a fully qualified URL for the API Server.'
      );
    }

    if (config.clientId) {
      this.clientId = config.clientId;
    }
    if (config.clientSecret) {
      this.clientSecret = config.clientSecret;
    }
    if (config.apiServer) {
      this.apiServer = config.apiServer;
    } else {
      this.apiServer = 'https://api.nylas.com';
    }

    const conn = new NylasConnection(this.clientSecret, {
      clientId: this.clientId,
    });
    this.connect = new Connect(conn, this.clientId, this.clientSecret);
    this.webhooks = new ManagementModelCollection(Webhook, conn, this.clientId);
    if (this.clientCredentials()) {
      this.accounts = new ManagementModelCollection(
        ManagementAccount,
        conn,
        this.clientId
      ) as ManagementModelCollection<ManagementAccount>;
    } else {
      this.accounts = new RestfulModelCollection(
        Account,
        conn
      ) as RestfulModelCollection<Account>;
    }

    return this;
  }

  static clientCredentials(): boolean {
    return this.clientId != null && this.clientSecret != null;
  }

  static with(accessToken: string): NylasConnection {
    if (!accessToken) {
      throw new Error('This function requires an access token');
    }
    return new NylasConnection(accessToken, { clientId: this.clientId });
  }

  static application(
    options?: ApplicationDetailsProperties
  ): Promise<ApplicationDetails> {
    if (!this.clientId) {
      throw new Error('This function requires a clientId');
    }

    if (!this.clientSecret) {
      throw new Error('This function requires a clientSecret');
    }

    const connection = new NylasConnection(null, { clientId: this.clientId });
    const requestOptions: RequestOptions = {
      path: `/a/${this.clientId}`,
    };

    if (options) {
      requestOptions.body = {
        application_name: options.applicationName,
        icon_url: options.iconUrl,
        redirect_uris: options.redirectUris,
      };
      requestOptions.method = 'PUT';
    }
    return connection.request(requestOptions).then(res => {
      return new ApplicationDetails().fromJSON(res);
    });
  }

  static exchangeCodeForToken(
    code: string,
    callback?: (error: Error | null, accessToken?: string) => void
  ): Promise<AccessToken> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        'exchangeCodeForToken() cannot be called until you provide a clientId and secret via config()'
      );
    }
    if (!code) {
      throw new Error('exchangeCodeForToken() must be called with a code');
    }

    const url = new URL(`${this.apiServer}/oauth/token`);
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('client_secret', this.clientSecret);
    url.searchParams.set('grant_type', 'authorization_code');
    url.searchParams.set('code', code);
    return fetch(url)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
      })
      .then(
        body => {
          if (!body || !body['access_token']) {
            let errorMessage = 'No access token in response';
            if (body && body.message) errorMessage = body.message;
            throw new Error(errorMessage);
          }
          if (callback) {
            callback(null, body);
          }
          return new AccessToken().fromJSON(body);
        },
        error => {
          const newError = new Error(error.message);
          if (callback) {
            callback(newError);
          }
          throw newError;
        }
      );
  }

  static urlForAuthentication(options: AuthenticateUrlConfig): string {
    if (!this.clientId) {
      throw new Error(
        'urlForAuthentication() cannot be called until you provide a clientId via config()'
      );
    }
    if (!options.redirectURI) {
      throw new Error('urlForAuthentication() requires options.redirectURI');
    }
    if (!options.loginHint) {
      options.loginHint = '';
    }
    let url = `${this.apiServer}/oauth/authorize?client_id=${this.clientId}&response_type=code&login_hint=${options.loginHint}&redirect_uri=${options.redirectURI}`;
    if (options.state != null) {
      url += `&state=${options.state}`;
    }
    if (options.scopes != null) {
      url += `&scopes=${options.scopes.join(',')}`;
    }
    if (options.provider != null) {
      url += `&provider=${options.provider}`;
    }
    if (options.redirectOnError) {
      url += '&redirect_on_error=true';
    }
    return url;
  }

  /**
   * Revoke a single access token
   * @param accessToken The access token to revoke
   */
  static revoke(accessToken: string): Promise<void> {
    return Nylas.with(accessToken)
      .request({
        method: 'POST',
        path: '/oauth/revoke',
      })
      .catch(err => Promise.reject(err));
  }
}

export = Nylas;
