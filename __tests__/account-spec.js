import Promise from 'bluebird';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Account from '../src/models/account';

describe('account', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('123');
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
});
