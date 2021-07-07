import NylasConnection from '../src/nylas-connection';

describe('account', () => {
  let testContext;
  const linkedAtNum = 1520546095;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('123', { clientId: 'foo' });
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

  test('should fetch an account model', done => {
    testContext.connection.account.get();
    expect(testContext.connection.request).toHaveBeenCalledWith({
      method: 'GET',
      path: '/account',
      qs: {},
    });
    done();
  });

  test('account attributes should resolve', done => {
    testContext.connection.account.get().then(function(account) {
      expect(account.id).toBe('hecea680y4sborshkiraj17c');
      expect(account.emailAddress).toBe('jeremy@emmerge.com');
      expect(account.organizationUnit).toBe('folder');
      expect(account.provider).toBe('eas');
      expect(account.syncState).toBe('running');
      expect(account.linkedAt).toEqual(new Date(linkedAtNum * 1000));
      done();
    });
  });
});
