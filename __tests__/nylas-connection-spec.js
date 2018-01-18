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
    })
  );
  describe('mismatched api version warnings', () => {
    test("should not warn if Nylas API version matches SDK supported API version", () => {
        const noWarning = testContext.connection._getWarningForVersion('2.0', '2.0')
        expect(noWarning).toEqual('')

        const warnSdk = testContext.connection._getWarningForVersion('1.0', '2.0')
        expect(warnSdk).toEqual(`WARNING: SDK version may not support your Nylas API version. SDK supports version 1.0 of the API and your application is currently running on version 2.0 of the API. Please update the sdk to ensure it works properly.`)

        const warnApi = testContext.connection._getWarningForVersion('2.0', '1.0')
        expect(warnApi).toEqual(`WARNING: SDK version may not support your Nylas API version. SDK supports version 2.0 of the API and your application is currently running on version 1.0 of the API. Please update the version of the API that your application is using through the developer dashboard.`)
    })
  })
});
