import _ from 'underscore';

import NylasConnection from '../src/nylas-connection';

import PACKAGE_JSON from '../package.json';
const SDK_VERSION = PACKAGE_JSON.version;

describe('NylasConnection', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('test-access-token');
  });

  describe('requestOptions', () =>
    test("should pass view='expanded' when expanded param is provided", () => {
      const options = {
        method: 'GET',
        path: '/threads/123',
        qs: { expanded: true },
      };
      const result = testContext.connection.requestOptions(options);
      expect(result.qs.expanded).toBeUndefined();
      expect(result.qs.view).toEqual('expanded');
      expect(result.headers['User-Agent']).toEqual(
        `Nylas Node SDK v${SDK_VERSION}`
      );
    }));
});
