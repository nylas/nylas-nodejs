import request from 'request';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Message from '../src/models/message';
import { Label } from '../src/models/folder';

const testUntil = fn => {
  let finished = false;
  runs(() => fn(callback => (finished = true)));
  waitsFor(() => finished);
};

describe('Label', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('123', { clientId: 'foo' });
    testContext.connection.request = jest.fn(() => Promise.resolve());
    testContext.label = new Label(testContext.connection);
    testContext.label.displayName = 'Label name';
    testContext.label.name = 'Longer label name';
  });

  describe('save', () => {
    test('should do a POST request if id is undefined', () => {
      testContext.label.save();
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'POST',
        body: {
          display_name: 'Label name',
        },
        qs: {},
        path: '/labels',
      });
    });

    test('should do a PUT if id is defined', () => {
      testContext.label.id = 'label_id';
      testContext.label.save();
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'PUT',
        body: {
          display_name: 'Label name',
        },
        qs: {},
        path: '/labels/label_id',
      });
    });
  });
});
