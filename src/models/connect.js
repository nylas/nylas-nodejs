export default class Connect {
  constructor(connection, clientId) {
    this.connection = connection;
    this.clientId = clientId; 
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

  token() {
    // https://docs.nylas.com/reference#connecttoken
  }

  newAccount() {
    // this.authorize() -> this.token()
  }
}
