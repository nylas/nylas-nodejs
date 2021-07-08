import Nylas from '../src/nylas';

describe('Connect', () => {
  const name = 'Connect Test';
  const password = 'connecting123';
  const scopes = 'email.modify,email.send,calendar,contacts';
  const exchangeEmail = 'connect_test@outlook.com';
  const CLIENT_ID = 'abc';
  const CLIENT_SECRET = 'xyz';
  const authorizeOptions = (email, provider, settings) => {
    return {
      name: name,
      email_address: email,
      provider: provider,
      settings: settings,
      scopes: scopes,
    };
  };
  const authorizeJSON = {
    code: 'bOjq4Wt9ZAlCy0CSbVeDGDQ5PquytC',
  };
  const tokenJSON = {
    access_token: 'the-token',
    account_id: 'the-account-id',
    billing_state: 'paid',
    email_address: 'erlich@aviato.com',
    id: 'the-id',
    linked_at: 1563496685,
    name: 'Erlich Bachman',
    object: 'account',
    organization_unit: 'folder',
    provider: 'eas',
    sync_state: 'running',
  };

  describe('authorize without clientId', () => {
    beforeEach(() => {
      Nylas.config({});
    });

    test('Should throw an error when the clientId is not passed in to Nylas.config()', done => {
      expect.assertions(2);
      const settings = { username: exchangeEmail, password: password };
      expect(() =>
        Nylas.connect.authorize(
          authorizeOptions(exchangeEmail, 'exchange', settings)
        )
      ).toThrow();
      expect(() => Nylas.connect.token(authorizeJSON.code)).toThrow();
      done();
    });
  });

  describe('authorize with clientId', () => {
    beforeEach(() => {
      Nylas.config({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      });
    });

    test('Should do a POST request to /connect/authorize', done => {
      expect.assertions(2);
      const settings = { username: exchangeEmail, password: password };
      Nylas.connect.connection.request = jest.fn(() =>
        Promise.resolve(authorizeJSON)
      );
      Nylas.connect
        .authorize(authorizeOptions(exchangeEmail, 'exchange', settings))
        .then(resp => {
          expect(resp).toEqual(authorizeJSON);
          expect(Nylas.connect.connection.request).toHaveBeenCalledWith({
            method: 'POST',
            path: '/connect/authorize',
            body: {
              client_id: CLIENT_ID,
              name: name,
              email_address: exchangeEmail,
              provider: 'exchange',
              settings: { username: exchangeEmail, password: password },
              scopes: scopes,
            },
          });
          done();
        });
    });

    test('Should do a POST request to /connect/token', done => {
      expect.assertions(2);
      Nylas.connect.connection.request = jest.fn(() =>
        Promise.resolve(tokenJSON)
      );
      Nylas.connect.token(authorizeJSON.code).then(resp => {
        expect(resp).toEqual(tokenJSON);
        expect(Nylas.connect.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          path: '/connect/token',
          body: {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: authorizeJSON.code,
          },
        });
        done();
      });
    });
  });
});
