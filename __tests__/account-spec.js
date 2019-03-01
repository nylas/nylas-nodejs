import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Account from '../src/models/account';

describe('account', () => {
  let testContext;
  const linkedAtNum = 1520546095;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('123', { clientId: "foo"});
    testContext.connection.request = jest.fn(() =>
      Promise.resolve({
        account_id: 'hecea680y4sborshkiraj17c',
        email_address: 'jeremy@emmerge.com',
        id: 'hecea680y4sborshkiraj17c',
        name: '',
        object: 'account',
        organization_unit: 'folder',
        provider: 'eas',
        sync_state: 'running',
        linked_at: linkedAtNum,
      })
    );
  });

  test('should fetch an account model', () => {
    testContext.connection.account.get();
    expect(testContext.connection.request).toHaveBeenCalledWith({
      method: 'GET',
      path: '/account',
      qs: {},
    });
  });

  test('linkedAt exists on account', () => {
    testContext.connection.account.get().then(function(account) {
      expect(account.linkedAt);
    });
  });
});
