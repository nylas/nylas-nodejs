import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import fetch from 'node-fetch';
import Scheduler, {
  SchedulerAvailableCalendars,
} from '../src/models/scheduler';
import Calendar from '../src/models/calendar';

jest.mock('node-fetch', () => {
  const { Request, Response } = jest.requireActual('node-fetch');
  const fetch = jest.fn();
  fetch.Request = Request;
  fetch.Response = Response;
  return fetch;
});

describe('Scheduler', () => {
  let testContext;

  beforeEach(() => {
    Nylas.config({
      clientId: 'myClientId',
      clientSecret: 'myClientSecret',
      apiServer: 'https://api.nylas.com',
    });
    testContext = {};
    testContext.connection = new NylasConnection('123', { clientId: 'foo' });
    jest.spyOn(testContext.connection, 'request');

    const response = receivedBody => {
      return {
        status: 200,
        buffer: () => {
          return Promise.resolve('body');
        },
        json: () => {
          return Promise.resolve(receivedBody);
        },
        headers: new Map(),
      };
    };

    fetch.mockImplementation(req => Promise.resolve(response(req.body)));

    testContext.scheduler = new Scheduler(testContext.connection);
  });

  describe('json', () => {
    test('Should deserialize the object properly', done => {
      const schedulerJSON = {
        app_client_id: 'test-client-id',
        app_organization_id: 0,
        config: {
          timezone: 'America/Los_Angeles',
        },
        edit_token: 'token',
        name: 'Test',
        slug: 'test-slug',
        created_at: new Date('2021-06-24T21:28:09Z'),
        modified_at: new Date('2021-06-24T21:28:09Z'),
      };
      const scheduler = new Scheduler(testContext.connection, schedulerJSON);

      expect(scheduler.appClientId).toEqual('test-client-id');
      expect(scheduler.appOrganizationId).toBe(0);
      expect(scheduler.config.timezone).toEqual('America/Los_Angeles');
      expect(scheduler.editToken).toEqual('token');
      expect(scheduler.name).toEqual('Test');
      expect(scheduler.slug).toEqual('test-slug');
      expect(scheduler.createdAt).toEqual(new Date('2021-06-24T21:28:09Z'));
      expect(scheduler.modifiedAt).toEqual(new Date('2021-06-24T21:28:09Z'));
      done();
    });

    test('Should serialize the object properly', done => {
      testContext.scheduler.id = 'abc-123';
      testContext.scheduler.appClientId = 'test-client-id';
      testContext.scheduler.appOrganizationId = 0;
      testContext.scheduler.config = {
        timezone: 'America/Los_Angeles',
      };
      testContext.scheduler.editToken = 'token';
      testContext.scheduler.name = 'Test';
      testContext.scheduler.slug = 'test-slug';
      testContext.scheduler.createdAt = new Date('2021-06-24T21:28:09Z');
      testContext.scheduler.modifiedAt = new Date('2021-06-24T21:28:09Z');
      testContext.scheduler.save().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.schedule.nylas.com/manage/pages/abc-123'
        );
        expect(options.method).toEqual('PUT');
        expect(JSON.parse(options.body)).toEqual({
          config: {
            timezone: 'America/Los_Angeles',
          },
          name: 'Test',
          slug: 'test-slug',
        });
        done();
      });
    });
  });

  describe('save', () => {
    test('Should do a POST request if the scheduler has no id', done => {
      testContext.scheduler.id = undefined;
      testContext.scheduler.save().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.schedule.nylas.com/manage/pages'
        );
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
          app_client_id: undefined,
          app_organization_id: undefined,
          config: undefined,
          edit_token: undefined,
          name: undefined,
          slug: undefined,
          created_at: undefined,
          modified_at: undefined,
        });
        done();
      });
    });

    test('Should do a PUT request if the scheduler an id', done => {
      testContext.scheduler.id = 'abc-123';
      testContext.scheduler.name = 'test';
      testContext.scheduler.save().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.schedule.nylas.com/manage/pages/abc-123'
        );
        expect(options.method).toEqual('PUT');
        expect(JSON.parse(options.body)).toEqual({
          app_client_id: undefined,
          app_organization_id: undefined,
          config: undefined,
          edit_token: undefined,
          name: 'test',
          slug: undefined,
          created_at: undefined,
          modified_at: undefined,
        });
        done();
      });
    });
  });

  describe('getAvailableCalendars', () => {
    beforeEach(() => {
      const calendarsJSON = [
        {
          calendars: [
            {
              id: 'test-calendar-id',
              name: 'Test Calendar',
              read_only: true,
            },
          ],
          email: 'test@example.com',
          id: 'test-response-id',
          name: 'John Doe',
        },
      ];
      const response = () => {
        return {
          status: 200,
          buffer: () => {
            return Promise.resolve('body');
          },
          json: () => {
            return Promise.resolve(calendarsJSON);
          },
          headers: new Map(),
        };
      };

      fetch.mockImplementation(() => Promise.resolve(response()));
    });

    test('Should do a GET request if the scheduler has an id', done => {
      testContext.scheduler.id = 'abc-123';
      testContext.scheduler.getAvailableCalendars().then(calendars => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.schedule.nylas.com/manage/pages/abc-123/calendars'
        );
        expect(options.method).toEqual('GET');
        expect(calendars.length).toBe(1);
        expect(calendars[0] instanceof SchedulerAvailableCalendars).toEqual(
          true
        );
        expect(calendars[0].calendars[0] instanceof Calendar).toEqual(true);
        expect(calendars[0].calendars[0].id).toEqual('test-calendar-id');
        expect(calendars[0].calendars[0].name).toEqual('Test Calendar');
        expect(calendars[0].calendars[0].readOnly).toEqual(true);
        expect(calendars[0].id).toEqual('test-response-id');
        expect(calendars[0].name).toEqual('John Doe');
        expect(calendars[0].email).toEqual('test@example.com');
        done();
      });
    });

    test('Should throw an error if scheduler has no id', done => {
      testContext.scheduler.id = undefined;
      expect(() => testContext.scheduler.getAvailableCalendars()).toThrow();
      done();
    });
  });

  describe('uploadImage', () => {
    test('Should do a PUT request if the scheduler has an id', done => {
      testContext.scheduler.id = 'abc-123';
      testContext.scheduler.uploadImage('image', 'logo.png').then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.schedule.nylas.com/manage/pages/abc-123/upload-image'
        );
        expect(options.method).toEqual('PUT');
        expect(JSON.parse(options.body)).toEqual({
          contentType: 'image',
          objectName: 'logo.png',
        });
        done();
      });
    });

    test('Should throw an error if scheduler has no id', done => {
      testContext.scheduler.id = undefined;
      expect(() =>
        testContext.scheduler.uploadImage('image', 'logo.png')
      ).toThrow();
      done();
    });
  });
});
