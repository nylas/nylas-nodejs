export default class Connect {
  constructor(connection) {
    this.connection = connection;
    if (!(this.connection instanceof require('../nylas-connection'))) {
      throw new Error('Connection object not provided');
    }
  }

  authorize() {
    // https://docs.nylas.com/reference#connectauthorize
  }

  token() {
    // https://docs.nylas.com/reference#connecttoken
  }

  newAccount() {
    // this.authorize() -> this.token()
  }
}
