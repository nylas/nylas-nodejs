import Nylas from '../src/nylas';
import { NativeAuthenticationProvider, Scope } from '../src/models/connect';

describe('Connect', () => {
  const name = 'Connect Test';
  const password = 'connecting123';
  const scopeString = 'email.modify,email.send,calendar,contacts';
  const scopes = [
    Scope.EmailModify,
    Scope.EmailSend,
    Scope.Calendar,
    Scope.Contacts,
  ];
  const exchangeEmail = 'connect_test@outlook.com';
  const CLIENT_ID = 'abc';
  const CLIENT_SECRET = 'xyz';
  const authorizeOptions = (email, provider, settings) => {
    return {
      name: name,
      emailAddress: email,
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
    const testContext = {};

    beforeEach(() => {
      testContext.nylasClient = new Nylas({});
    });

    test('Should throw an error when the clientId is not passed in to Nylas.config()', done => {
      expect.assertions(2);
      const settings = { username: exchangeEmail, password: password };
      expect(() =>
        testContext.nylasClient.connect.authorize(
          authorizeOptions(
            exchangeEmail,
            NativeAuthenticationProvider.Exchange,
            settings
          )
        )
      ).toThrow();
      expect(() =>
        testContext.nylasClient.connect.token(authorizeJSON.code)
      ).toThrow();
      done();
    });
  });

  describe('authorize with clientId', () => {
    const testContext = {};

    beforeEach(() => {
      testContext.nylasClient = new Nylas({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      });
    });

    test('Should do a POST request to /connect/authorize', done => {
      expect.assertions(2);
      const settings = { username: exchangeEmail, password: password };
      testContext.nylasClient.connect.connection.request = jest.fn(() =>
        Promise.resolve(authorizeJSON)
      );
      testContext.nylasClient.connect
        .authorize(
          authorizeOptions(
            exchangeEmail,
            NativeAuthenticationProvider.Exchange,
            settings
          )
        )
        .then(resp => {
          expect(resp).toEqual(authorizeJSON);
          expect(
            testContext.nylasClient.connect.connection.request
          ).toHaveBeenCalledWith({
            method: 'POST',
            path: '/connect/authorize',
            body: {
              client_id: CLIENT_ID,
              name: name,
              email_address: exchangeEmail,
              provider: 'exchange',
              settings: { username: exchangeEmail, password: password },
              scopes: scopeString,
            },
          });
          done();
        });
    });

    test('Should do a POST request to /connect/token', done => {
      expect.assertions(2);
      testContext.nylasClient.connect.connection.request = jest.fn(() =>
        Promise.resolve(tokenJSON)
      );
      testContext.nylasClient.connect.token(authorizeJSON.code).then(resp => {
        expect(resp.toJSON()).toEqual(tokenJSON);
        expect(
          testContext.nylasClient.connect.connection.request
        ).toHaveBeenCalledWith({
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
