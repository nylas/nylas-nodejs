import _ from 'underscore';

import NylasConnection from '../src/nylas-connection';

import PACKAGE_JSON from '../package.json';
const SDK_VERSION = PACKAGE_JSON.version;

describe('NylasConnection', function() {
  beforeEach(function() {
    this.connection = new NylasConnection('test-access-token');
  });

  describe('requestOptions', () =>
    it("should pass view='expanded' when expanded param is provided", function() {
      const options = {
        method: 'GET',
        path: '/threads/123',
        qs: { expanded: true },
      };
      const result = this.connection.requestOptions(options);
      expect(result.qs.expanded).toBeUndefined();
      expect(result.qs.view).toEqual('expanded');
      expect(result.headers['User-Agent']).toEqual(
        `Nylas Node SDK v${SDK_VERSION}`
      );
    }));
});
