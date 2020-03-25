import NylasConnection from '../nylas-connection';

export default class Connect {
  connection: NylasConnection;
  clientId: string;
  clientSecret: string;

  constructor(
    connection: NylasConnection,
    clientId: string,
    clientSecret: string
  ) {
    this.connection = connection;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  authorize(options: { [key: string]: any } = {}) {
    // https://docs.nylas.com/reference#connectauthorize
    if (!this.clientId) {
      throw new Error(
        'connect.authorize() cannot be called until you provide a clientId via Nylas.config()'
      );
    }
    return this.connection.request({
      method: 'POST',
      path: '/connect/authorize',
      body: {
        client_id: this.clientId,
        name: options.name,
        email_address: options.email_address,
        provider: options.provider,
        settings: options.settings,
        scopes: options.scopes,
      },
    });
  }

  token(code: string) {
    // https://docs.nylas.com/reference#connecttoken
    if (!this.clientId) {
      throw new Error(
        'connect.token() cannot be called until you provide a clientId via Nylas.config()'
      );
    }
    if (!this.clientSecret) {
      throw new Error(
        'connect.token() cannot be called until you provide a clientSecret via Nylas.config()'
      );
    }
    return this.connection.request({
      method: 'POST',
      path: '/connect/token',
      body: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
      },
    });
  }

  newAccount() {
    // this.authorize() -> this.token()
  }
}
