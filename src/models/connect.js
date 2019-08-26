export default class Connect {
  constructor(connection, clientId) {
    this.connection = connection;
    if (!(this.connection instanceof require('../nylas-connection'))) { // will this ever be hit? i don't think we need this
      throw new Error('Connection object not provided');
    }
    this.clientId = clientId; 
  }

  authorize(params = {}) {
    // https://docs.nylas.com/reference#connectauthorize
    if (!this.clientId) {
      throw new Error('connect.authorize() cannot be called until you provide a clientId via Nylas.config()');
    }
    
    return this.connection
      .request({
        method: 'POST',
        path: '/connect/authorize',
        body: { 
          client_id: this.clientId,
          name: params.name,
          email_address: params.emailAddress,
          provider: params.provider,
          settings: params.settings,
          scopes: params.scopes,
          reauth_account_id: params.reauthAccountId, // optional existing account ID to re-auth
        },
      })
      .catch(err => Promise.reject(err));
  }

  token() {
    // https://docs.nylas.com/reference#connecttoken
  }

  newAccount() {
    // this.authorize() -> this.token()
  }
}
