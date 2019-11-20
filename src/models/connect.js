export default class Connect {
  constructor(connection, clientId, clientSecret) {
    this.connection = connection;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  authorize(options = {}) {
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

  token(code) {
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
