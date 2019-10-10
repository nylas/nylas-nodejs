export default class Connect {
  constructor(connection, clientId, clientSecret, googleClientId, googleClientSecret) {
    this.connection = connection;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.googleClientId = googleClientId;
    this.googleClientSecret = googleClientSecret;
  }

  authorize(options = {}) {
    // https://docs.nylas.com/reference#connectauthorize
    if (!this.clientId) {
      throw new Error(
        'connect.authorize() cannot be called until you provide a clientId via Nylas.config()'
      );
    }
    return this.connection
      .request({
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
      })
      .then(resp => resp)
      .catch(err => Promise.resolve(err));
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
    return this.connection
      .request({
        method: 'POST',
        path: '/connect/token',
        body: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
        },
      })
      .then(resp => resp)
      .catch(err => Promise.resolve(err));
  }

  newAccount() {
    // this.authorize() -> this.token()
  }

  async gmailAccount({ name, emailAddress, scopes, googleClientId, googleClientSecret, googleRefreshToken }) {
    const googleOptions = {
      name: name,
      email_address: emailAddress,
      provider: 'gmail',
      settings: {
        googleClientId: googleClientId || this.googleClientId,
        googleClientSecret: googleClientSecret || this.googleClientSecret,
        googleRefreshToken: googleRefreshToken
      }
    }

    if (scopes) {
      googleOptions.scopes = scopes;
    }

    token = await this.authorize(googleOptions);
    return this.token(token);
  }
}
