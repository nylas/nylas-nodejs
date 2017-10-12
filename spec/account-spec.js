import Promise from 'bluebird';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Account from '../src/models/account';

describe('account', function() {
  beforeEach(function() {
    this.connection = new NylasConnection('123');
  });

  return it('should fetch an account model', function() {
    const result = {
      account_id: 'hecea680y4sborshkiraj17c',
      email_address: 'jeremy@emmerge.com',
      id: 'hecea680y4sborshkiraj17c',
      name: '',
      object: 'account',
      organization_unit: 'folder',
      provider: 'eas',
      sync_state: 'running',
    };
    spyOn(this.connection, 'request').andCallFake(() =>
      Promise.resolve(result)
    );

    this.connection.account.get();
    expect(this.connection.request).toHaveBeenCalledWith({
      method: 'GET',
      path: '/account',
      qs: {},
    });
  });
});
