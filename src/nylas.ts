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
import { AuthenticateUrlConfig, NylasConfig, ResponseType } from './config';
import AccessToken from './models/access-token';
import ApplicationDetails, {
  ApplicationDetailsProperties,
} from './models/application-details';

class Nylas {
  clientId = '';
  get clientSecret(): string {
    return config.clientSecret;
  }
  set clientSecret(newClientSecret: string) {
    config.setClientSecret(newClientSecret);
  }
  get apiServer(): string | null {
    return config.apiServer;
  }
  set apiServer(newApiServer: string | null) {
    config.setApiServer(newApiServer);
  }
  accounts:
    | ManagementModelCollection<ManagementAccount>
    | RestfulModelCollection<Account>;
  connect: Connect;
  webhooks: ManagementModelCollection<Webhook>;

  constructor(config: NylasConfig) {
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

  /**
   * Checks if the Nylas instance has been configured with credentials
   * @return True if the Nylas instance has been configured with credentials
   */
  clientCredentials(): boolean {
    return this.clientId != null && this.clientSecret != null;
  }

  /**
   * Configure a NylasConnection instance to access a user's resources
   * @param accessToken The access token to access the user's resources
   * @return The configured NylasConnection instance
   */
  with(accessToken: string): NylasConnection {
    if (!accessToken) {
      throw new Error('This function requires an access token');
    }
    return new NylasConnection(accessToken, { clientId: this.clientId });
  }

  /**
   * Return information about a Nylas application
   * @param options Application details to overwrite
   * @return Information about the Nylas application
   */
  application(
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

  /**
   * Exchange an authorization code for an access token
   * @param code Application details to overwrite
   * @param callback Application details to overwrite
   * @return Information about the Nylas application
   */
  exchangeCodeForToken(
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

  /**
   * Build the URL for authenticating users to your application via Hosted Authentication
   * @param options Configuration for the authentication process
   * @return The URL for hosted authentication
   */
  urlForAuthentication(options: AuthenticateUrlConfig): string {
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
    let url = `${this.apiServer}/oauth/authorize?client_id=${
      this.clientId
    }&response_type=${options.responseType || ResponseType.CODE}&login_hint=${
      options.loginHint
    }&redirect_uri=${options.redirectURI}`;
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
  revoke(accessToken: string): Promise<void> {
    return this.with(accessToken)
      .request({
        method: 'POST',
        path: '/oauth/revoke',
      })
      .catch(err => Promise.reject(err));
  }
}

export = Nylas;
