import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import ManagementAccount from '../src/models/management-account';

describe('ManagementAccount', () => {
  const CLIENT_ID = 'abc';
  const ACCOUNT_ID = '8rilmlwuo4zmpjedz8bcplclk';
  beforeEach(() => {
    Nylas.config({
      clientId: CLIENT_ID,
      clientSecret: 'xyz',
    });
  });

  describe('list', () => {
    test('should do a GET request to get the account list', done => {
      Nylas.accounts.connection.request = jest.fn(() =>
        Promise.resolve([
          {
            account_id: '8rilmlwuo4zmpjedz8bcplclk',
            billing_state: 'paid',
            email: 'margaret@hamilton.com',
            id: ACCOUNT_ID,
            provider: 'gmail',
            sync_state: 'running',
            trial: false,
            metadata: {
              test: 'true',
            },
          },
        ])
      );
      Nylas.accounts.list({}, (err, accounts) => {
        expect(accounts.length).toEqual(1);
        expect(accounts[0].id).toEqual('8rilmlwuo4zmpjedz8bcplclk');
        expect(accounts[0].billingState).toEqual('paid');
        expect(accounts[0].emailAddress).toEqual('margaret@hamilton.com');
        expect(accounts[0].provider).toEqual('gmail');
        expect(accounts[0].metadata).toEqual({
          test: 'true',
        });
        expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
          method: 'GET',
          qs: { limit: 100, offset: 0 },
          path: `/a/${CLIENT_ID}/accounts`,
        });
        done();
      });
    });
  });

  describe('upgrade', () => {
    test('should POST to upgrade an account', done => {
      expect.assertions(4);
      const requestMock = jest.fn();
      requestMock
        .mockReturnValueOnce(
          Promise.resolve([
            {
              account_id: '8rilmlwuo4zmpjedz8bcplclk',
              billing_state: 'free',
              id: ACCOUNT_ID,
              sync_state: 'running',
              trial: false,
            },
          ])
        )
        .mockReturnValueOnce(Promise.resolve({ success: 'true' }));
      Nylas.accounts.connection.request = requestMock;
      Nylas.accounts
        .first()
        .then(account => account.upgrade())
        .then(resp => {
          expect(Nylas.accounts.connection.request).toHaveBeenCalledTimes(2);
          expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
            method: 'GET',
            qs: { limit: 1, offset: 0 },
            path: `/a/${CLIENT_ID}/accounts`,
          });
          expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
            method: 'POST',
            path: `/a/${CLIENT_ID}/accounts/${ACCOUNT_ID}/upgrade`,
          });
          expect(resp.success).toBe('true');
          done();
        });
    });
  });

  describe('downgrade', () => {
    test('should POST to downgrade an account', done => {
      expect.assertions(4);
      const requestMock = jest.fn();
      requestMock
        .mockReturnValueOnce(
          Promise.resolve([
            {
              account_id: '8rilmlwuo4zmpjedz8bcplclk',
              billing_state: 'free',
              id: ACCOUNT_ID,
              sync_state: 'running',
              trial: false,
            },
          ])
        )
        .mockReturnValueOnce(Promise.resolve({ success: 'true' }));
      Nylas.accounts.connection.request = requestMock;
      Nylas.accounts
        .first()
        .then(account => account.downgrade())
        .then(resp => {
          expect(Nylas.accounts.connection.request).toHaveBeenCalledTimes(2);
          expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
            method: 'GET',
            qs: { limit: 1, offset: 0 },
            path: `/a/${CLIENT_ID}/accounts`,
          });
          expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
            method: 'POST',
            path: `/a/${CLIENT_ID}/accounts/${ACCOUNT_ID}/downgrade`,
          });
          expect(resp.success).toBe('true');
          done();
        });
    });
  });

  describe('revokeAll', () => {
    test('should POST to revoke all tokens of an account', done => {
      expect.assertions(4);
      const requestMock = jest.fn();
      requestMock
        .mockReturnValueOnce(
          Promise.resolve([
            {
              account_id: '8rilmlwuo4zmpjedz8bcplclk',
              billing_state: 'free',
              id: ACCOUNT_ID,
              sync_state: 'running',
              trial: false,
            },
          ])
        )
        .mockReturnValueOnce(Promise.resolve({ success: 'true' }));
      Nylas.accounts.connection.request = requestMock;
      Nylas.accounts
        .first()
        .then(account => account.revokeAll())
        .then(resp => {
          expect(Nylas.accounts.connection.request).toHaveBeenCalledTimes(2);
          expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
            method: 'GET',
            qs: { limit: 1, offset: 0 },
            path: `/a/${CLIENT_ID}/accounts`,
          });
          expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
            method: 'POST',
            path: `/a/${CLIENT_ID}/accounts/${ACCOUNT_ID}/revoke-all`,
            body: { keep_access_token: undefined },
          });
          expect(resp.success).toBe('true');
          done();
        });
    });
    test('should POST to revoke all tokens of an account except one token', done => {
      expect.assertions(4);
      const requestMock = jest.fn();
      requestMock
        .mockReturnValueOnce(
          Promise.resolve([
            {
              account_id: '8rilmlwuo4zmpjedz8bcplclk',
              billing_state: 'free',
              id: ACCOUNT_ID,
              sync_state: 'running',
              trial: false,
            },
          ])
        )
        .mockReturnValueOnce(Promise.resolve({ success: 'true' }));
      Nylas.accounts.connection.request = requestMock;
      Nylas.accounts
        .first()
        .then(account => account.revokeAll('abc123'))
        .then(resp => {
          expect(Nylas.accounts.connection.request).toHaveBeenCalledTimes(2);
          expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
            method: 'GET',
            qs: { limit: 1, offset: 0 },
            path: `/a/${CLIENT_ID}/accounts`,
          });
          expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
            method: 'POST',
            path: `/a/${CLIENT_ID}/accounts/${ACCOUNT_ID}/revoke-all`,
            body: { keep_access_token: 'abc123' },
          });
          expect(resp.success).toBe('true');
          done();
        });
    });
  });

  describe('ip_addresses', () => {
    test('should do a GET request to get the ip_addresses', done => {
      expect.assertions(2);
      const requestMock = jest.fn();
      requestMock
        .mockReturnValueOnce(
          Promise.resolve([
            {
              account_id: '8rilmlwuo4zmpjedz8bcplclk',
              billing_state: 'free',
              id: ACCOUNT_ID,
              sync_state: 'running',
              trial: false,
            },
          ])
        )
        .mockReturnValueOnce(
          Promise.resolve({
            ip_addresses: [
              '52.25.153.17',
              '52.26.120.161',
              '52.39.252.208',
              '54.71.62.98',
              '34.208.138.149',
              '52.88.199.110',
              '54.69.11.122',
              '54.149.110.158',
            ],
            updated_at: 1544658529,
          })
        );
      Nylas.accounts.connection.request = requestMock;
      Nylas.accounts
        .first()
        .then(account => account.ipAddresses())
        .then(resp => {
          expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
            method: 'GET',
            path: `/a/${CLIENT_ID}/ip_addresses`,
          });
          expect(resp.updated_at).toBe(1544658529);
          done();
        });
    });
  });

  describe('tokenInfo', () => {
    test("should POST to get info on account's access token", done => {
      expect.assertions(7);
      const requestMock = jest.fn();
      requestMock
        .mockReturnValueOnce(
          Promise.resolve([
            {
              account_id: '8rilmlwuo4zmpjedz8bcplclk',
              billing_state: 'free',
              id: ACCOUNT_ID,
              sync_state: 'running',
              trial: false,
            },
          ])
        )
        .mockReturnValueOnce(
          Promise.resolve({
            created_at: 1563496685,
            scopes: 'calendar,email,contacts',
            state: 'valid',
            updated_at: 1563496685,
          })
        );
      Nylas.accounts.connection.request = requestMock;
      Nylas.accounts
        .first()
        .then(account => account.tokenInfo('abc123'))
        .then(resp => {
          expect(Nylas.accounts.connection.request).toHaveBeenCalledTimes(2);
          expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
            method: 'GET',
            qs: { limit: 1, offset: 0 },
            path: `/a/${CLIENT_ID}/accounts`,
          });
          expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
            method: 'POST',
            path: `/a/${CLIENT_ID}/accounts/${ACCOUNT_ID}/token-info`,
            body: { access_token: 'abc123' },
          });
          expect(resp.created_at).toBe(1563496685);
          expect(resp.scopes).toBe('calendar,email,contacts');
          expect(resp.state).toBe('valid');
          expect(resp.updated_at).toBe(1563496685);
          done();
        });
    });

    test('should error when no access token passed in', done => {
      expect.assertions(4);
      const requestMock = jest.fn();
      requestMock
        .mockReturnValueOnce(
          Promise.resolve([
            {
              account_id: '8rilmlwuo4zmpjedz8bcplclk',
              billing_state: 'free',
              id: ACCOUNT_ID,
              sync_state: 'running',
              trial: false,
            },
          ])
        )
        .mockReturnValueOnce(Promise.resolve('Error: No access_token passed.'));
      Nylas.accounts.connection.request = requestMock;
      Nylas.accounts
        .first()
        .then(account => account.tokenInfo())
        .then(resp => {
          expect(Nylas.accounts.connection.request).toHaveBeenCalledTimes(2);
          expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
            method: 'GET',
            qs: { limit: 1, offset: 0 },
            path: `/a/${CLIENT_ID}/accounts`,
          });
          expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
            method: 'POST',
            path: `/a/${CLIENT_ID}/accounts/${ACCOUNT_ID}/token-info`,
            body: { access_token: undefined },
          });
          expect(resp).toBe('Error: No access_token passed.');
          done();
        });
    });
  });

  describe('save', () => {
    test('Should update only metadata when saving', async done => {
      Nylas.accounts.connection = new NylasConnection('123', {
        clientId: CLIENT_ID,
      });
      Nylas.accounts.connection.request = jest.fn(() => Promise.resolve({}));
      const accJson = {
        account_id: '8rilmlwuo4zmpjedz8bcplclk',
        billing_state: 'paid',
        email: 'margaret@hamilton.com',
        id: ACCOUNT_ID,
        provider: 'gmail',
        sync_state: 'running',
        trial: false,
      };
      const account = new ManagementAccount(
        Nylas.accounts.connection,
        CLIENT_ID,
        accJson
      );
      account.metadata = {
        test: 'true',
      };

      account.save().then(() => {
        expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
          method: 'PUT',
          path: `/a/${CLIENT_ID}/accounts/${ACCOUNT_ID}`,
          qs: {},
          body: {
            metadata: {
              test: 'true',
            },
          },
        });
        done();
      });
    });
  });
});
