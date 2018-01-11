import Promise from 'bluebird';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Contact from '../src/models/contact';

describe('Contact', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('123');
    testContext.connection.request = jest.fn(() => {
      return Promise.resolve();
    });
    testContext.contact = new Contact(testContext.connection);
    return Promise.onPossiblyUnhandledRejection((e, promise) => {});
  });

  test('should make GET request for the picture', () => {
    testContext.contact.id = 'a_pic_url';
    testContext.contact.getPicture();
    expect(testContext.connection.request).toHaveBeenCalledWith({
      method: 'GET',
      path: '/contacts/a_pic_url/picture',
      qs: {},
    });
  });
});
