import Nylas from '../src/nylas';

describe('ManagementAccount', () => {
  const APP_ID = 'abc';
  beforeEach(() => {
    Nylas.config({
      appId: APP_ID,
      appSecret: 'xyz',
    });
  });

  describe('list', () => {
    test('should do a GET request to get the account list', () => {
      Nylas.accounts.connection.request = jest.fn(() =>
        Promise.resolve([
          {
            account_id: '8rilmlwuo4zmpjedz8bcplclk',
            billing_state: 'free',
            id: '8rilmlwuo4zmpjedz8bcplclk',
            sync_state: 'running',
            trial: false,
          },
        ])
      );
      Nylas.accounts
        .list({}, (err, accounts) => {
          expect(accounts.length).toEqual(1);
          expect(accounts[0].id).toEqual('8rilmlwuo4zmpjedz8bcplclk');
        })
        .then(() =>
          expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
            method: 'GET',
            qs: { limit: 100, offset: 0 },
            path: `/a/${APP_ID}/accounts`,
          })
        )
        .catch(() => {});
    });
  });

  describe('upgrade', () => {
    test('should POST to upgrade an account', () => {
      Nylas.accounts.connection.request = jest.fn(() =>
        Promise.resolve([
          {
            success: 'true',
          },
        ])
      );
      Nylas.accounts
        .first()
        .then(account => account.upgrade())
        .then(resp => {
          expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
            method: 'POST',
            path: `/a/${APP_ID}/accounts/upgrade`,
          });
          expect(resp.success).toBe('true');
        })
        .catch(() => {});
    });
  });

  describe('downgrade', () => {
    test('should POST to downgrade an account', () => {
      Nylas.accounts.connection.request = jest.fn(() =>
        Promise.resolve([
          {
            success: 'true',
          },
        ])
      );
      Nylas.accounts
        .first()
        .then(account => account.downgrade())
        .then(resp => {
          expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
            method: 'POST',
            path: `/a/${APP_ID}/accounts/downgrade`,
          });
          expect(resp.success).toBe('true');
        })
        .catch(() => {});
    })
  });

  describe(
    'revokeAll',
    () =>
      test('should POST to revoke all tokens of an account', () => {
        Nylas.accounts.connection.request = jest.fn(() =>
          Promise.resolve([
            {
              success: 'true',
            },
          ])
        );
        Nylas.accounts
          .first()
          .then(account => account.revokeAll())
          .then(resp => {
            expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
              method: 'POST',
              path: `/a/${APP_ID}/accounts/revoke_all`,
              body: { keep_access_token: undefined },
            });
            expect(resp.success).toBe('true');
          })
          .catch(() => {});
      }),

    test('should POST to revoke all tokens of an account except one token', () => {
      Nylas.accounts.connection.request = jest.fn(() =>
        Promise.resolve([
          {
            success: 'true',
          },
        ])
      );
      Nylas.accounts
        .first()
        .then(account => account.revokeAll('abc123'))
        .then(resp => {
          expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
            method: 'POST',
            path: `/a/${APP_ID}/accounts/revoke_all`,
            body: { keep_access_token: 'abc123' },
          });
          expect(resp.success).toBe('true');
        })
        .catch(() => {});
    })
  );
});
