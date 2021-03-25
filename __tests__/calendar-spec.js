import request from 'request';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Calendar from '../src/models/calendar';

describe('Calendar', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('123', { clientId: 'foo' });
    const calendarJSON = {
      account_id: "eof2wrhqkl7kdwhy9hylpv9o9",
      description: "All the holidays",
      id: "8e570s302fdazx9zqwiuk9jqn",
      is_primary: false,
      job_status_id: "48pp6ijzrxpw9jors9ylnsxnf",
      location: "Santa Monica, CA",
      name: "Holidays",
      object: "calendar",
      read_only: false,
      timezone: "America/Los_Angeles"
    };
    testContext.connection.request = jest.fn(() => Promise.resolve(calendarJSON));
    testContext.calendar = new Calendar(testContext.connection, calendarJSON);
  });

  test('[SAVE] should do a POST request if the calendar has no id', done => {
    expect.assertions(11);
    testContext.calendar.id = undefined;
    testContext.calendar.save().then((calendar) => {
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'POST',
        body: {
          name: 'Holidays',
          description: 'All the holidays',
          location: 'Santa Monica, CA',
          timezone: 'America/Los_Angeles'
        },
        qs: {},
        path: '/calendars',
      });
      expect(calendar.id).toEqual('8e570s302fdazx9zqwiuk9jqn');
      expect(calendar.accountId).toEqual('eof2wrhqkl7kdwhy9hylpv9o9');
      expect(calendar.description).toEqual('All the holidays');
      expect(calendar.isPrimary).toEqual(false);
      expect(calendar.location).toEqual('Santa Monica, CA');
      expect(calendar.name).toEqual('Holidays');
      expect(calendar.object).toEqual('calendar');
      expect(calendar.timezone).toEqual('America/Los_Angeles');
      expect(calendar.readOnly).toEqual(false);
      expect(calendar.jobStatusId).toEqual('48pp6ijzrxpw9jors9ylnsxnf')
      done();
    });
  });

  test('[SAVE] should do a PUT request if the event has an id', done => {
    expect.assertions(10);
    testContext.calendar.id = '8e570s302fdazx9zqwiuk9jqn';
    testContext.calendar.description = 'Updated description';
    testContext.calendar.save().then((calendar) => {
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'PUT',
        body: {
          name: 'Holidays',
          description: 'Updated description',
          location: 'Santa Monica, CA',
          timezone: 'America/Los_Angeles'
        },
        qs: {},
        path: '/calendars/8e570s302fdazx9zqwiuk9jqn',
      });
      expect(calendar.id).toEqual('8e570s302fdazx9zqwiuk9jqn');
      expect(calendar.accountId).toEqual('eof2wrhqkl7kdwhy9hylpv9o9');
      expect(calendar.description).toEqual('All the holidays');
      expect(calendar.isPrimary).toEqual(false);
      expect(calendar.location).toEqual('Santa Monica, CA');
      expect(calendar.name).toEqual('Holidays');
      expect(calendar.object).toEqual('calendar');
      expect(calendar.timezone).toEqual('America/Los_Angeles');
      expect(calendar.readOnly).toEqual(false);
      done();
    });
  });

  test('[FIND] should use correct method and route', done => {
    expect.assertions(10);
    testContext.connection.calendars.find('8e570s302fdazx9zqwiuk9jqn').then((calendar) => {
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'GET',
        qs: {},
        path: '/calendars/8e570s302fdazx9zqwiuk9jqn',
      });
      expect(calendar.id).toEqual('8e570s302fdazx9zqwiuk9jqn');
      expect(calendar.accountId).toEqual('eof2wrhqkl7kdwhy9hylpv9o9');
      expect(calendar.description).toEqual('All the holidays');
      expect(calendar.isPrimary).toEqual(false);
      expect(calendar.location).toEqual('Santa Monica, CA');
      expect(calendar.name).toEqual('Holidays');
      expect(calendar.object).toEqual('calendar');
      expect(calendar.timezone).toEqual('America/Los_Angeles');
      expect(calendar.readOnly).toEqual(false);
      done();
    });
  });

  test('[GET job status] should use correct method and route', done => {
    expect.assertions(1);
    testContext.calendar.getJobStatus().then(calendar => {
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'GET',
        qs: {},
        path: '/job-statuses/48pp6ijzrxpw9jors9ylnsxnf',
      });
      done();
    });
  });

  test('[GET job status] should error without job status id', done => {
    expect.assertions(1);
    const error = new Error('jobStatusId must be defined');
    testContext.calendar.jobStatusId = undefined;
    testContext.calendar.getJobStatus().catch(err => {
      expect(err).toEqual(error);
      done();
    });
  });
});
