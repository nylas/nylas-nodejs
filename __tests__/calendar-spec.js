import request from 'request';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Calendar from '../src/models/calendar';

describe('Calendar', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('123', { clientId: 'foo' });
    testContext.connection.request = jest.fn(() => Promise.resolve());
    testContext.calendar = new Calendar(testContext.connection);
    testContext.calendar.name = 'Holidays';
    testContext.calendar.description = 'All the holidays';
  });

  test('should do a POST request if the calendar has no id', done => {
    testContext.calendar.id = undefined;
    testContext.calendar.save().then(() => {
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'POST',
        body: {
          name: 'Holidays',
          description: 'All the holidays',
          location: undefined,
          timezone: undefined
        },
        qs: {},
        path: '/calendars',
      });
      done();
    });
  });

  test('should do a PUT request if the event has an id', done => {
    testContext.calendar.id = 'id-1234';
    testContext.calendar.description = 'Updated description';
    testContext.calendar.save().then(() => {
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'PUT',
        body: {
          name: 'Holidays',
          description: 'Updated description',
          location: undefined,
          timezone: undefined
        },
        qs: {},
        path: '/calendars/id-1234',
      });
      done();
    });
  });
});
