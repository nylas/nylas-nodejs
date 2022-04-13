import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import fetch from 'node-fetch';
import Draft from '../src/models/draft';
import OutboxMessage from '../src/models/outbox-message';
import OutboxJobStatus from '../src/models/outbox-job-status';
import { SendGridVerifiedStatus } from '../src/models/outbox';

jest.mock('node-fetch', () => {
  const { Request, Response } = jest.requireActual('node-fetch');
  const fetch = jest.fn();
  fetch.Request = Request;
  fetch.Response = Response;
  return fetch;
});

describe('Outbox', () => {
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
        clone: () => response(receivedBody),
        text: () => {
          return Promise.resolve(receivedBody);
        },
        json: () => {
          return Promise.resolve(receivedBody);
        },
        headers: new Map(),
      };
    };

    fetch.mockImplementation(req => Promise.resolve(response(req.body)));

    testContext.draft = new Draft(testContext.connection, {
      to: [{ name: 'me', email: 'test@email.com' }],
      subject: 'This is an email',
    });
  });

  test('should do a POST request for send', done => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    return testContext.connection.outbox
      .send(testContext.draft, {
        sendAt: tomorrow,
        retryLimitDatetime: dayAfter,
      })
      .then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.nylas.com/v2/outbox'
        );
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
          to: [{ name: 'me', email: 'test@email.com' }],
          subject: 'This is an email',
          send_at: Math.floor(tomorrow.getTime() / 1000.0),
          retry_limit_datetime: Math.floor(dayAfter.getTime() / 1000.0),
          cc: [],
          bcc: [],
          from: [],
          date: null,
          body: undefined,
          events: [],
          unread: undefined,
          snippet: undefined,
          thread_id: undefined,
          version: undefined,
          folder: undefined,
          starred: undefined,
          labels: [],
          file_ids: [],
          headers: undefined,
          reply_to: [],
          reply_to_message_id: undefined,
        });
        done();
      });
  });

  test('should do a PATCH request for update', done => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    testContext.draft.subject = 'updated subject';

    return testContext.connection.outbox
      .update('job-status-id', {
        updatedMessage: testContext.draft,
        sendAt: tomorrow,
        retryLimitDatetime: dayAfter,
      })
      .then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.nylas.com/v2/outbox/job-status-id'
        );
        expect(options.method).toEqual('PATCH');
        expect(JSON.parse(options.body)).toEqual({
          to: [{ name: 'me', email: 'test@email.com' }],
          subject: 'updated subject',
          send_at: Math.floor(tomorrow.getTime() / 1000.0),
          retry_limit_datetime: Math.floor(dayAfter.getTime() / 1000.0),
          cc: [],
          bcc: [],
          from: [],
          date: null,
          body: undefined,
          events: [],
          unread: undefined,
          snippet: undefined,
          thread_id: undefined,
          version: undefined,
          folder: undefined,
          starred: undefined,
          labels: [],
          file_ids: [],
          headers: undefined,
          reply_to: [],
          reply_to_message_id: undefined,
        });
        done();
      });
  });

  test('should do a DELETE request for delete', done => {
    return testContext.connection.outbox.delete('job-status-id').then(() => {
      const options = testContext.connection.request.mock.calls[0][0];
      expect(options.url.toString()).toEqual(
        'https://api.nylas.com/v2/outbox/job-status-id'
      );
      expect(options.method).toEqual('DELETE');
      done();
    });
  });

  describe('deserialization', () => {
    test('should deserialize OutboxMessage properly', () => {
      const json = {
        to: [{ name: 'me', email: 'test@email.com' }],
        subject: 'This is an email',
        send_at: 1646245940,
        original_send_at: 1646245940,
        retry_limit_datetime: 1646332340,
      };

      const outboxMessage = new OutboxMessage(testContext.connection).fromJSON(
        json
      );

      expect(outboxMessage.to.length).toBe(1);
      expect(outboxMessage.to[0].name).toEqual('me');
      expect(outboxMessage.to[0].email).toEqual('test@email.com');
      expect(outboxMessage.subject).toEqual('This is an email');
      expect(outboxMessage.sendAt).toEqual(new Date(1646245940 * 1000));
      expect(outboxMessage.originalSendAt).toEqual(new Date(1646245940 * 1000));
      expect(outboxMessage.retryLimitDatetime).toEqual(
        new Date(1646332340 * 1000)
      );
    });

    test('should deserialize OutboxJobStatus properly', () => {
      const json = {
        job_status_id: 'job-status-id',
        status: 'pending',
        account_id: 'account-id',
        original_data: {
          to: [{ name: 'me', email: 'test@email.com' }],
          subject: 'This is an email',
          send_at: 1646245940,
          original_send_at: 1646245940,
          retry_limit_datetime: 1646332340,
        },
      };

      const outboxJobStatus = new OutboxJobStatus().fromJSON(
        json,
        testContext.connection
      );

      expect(outboxJobStatus.jobStatusId).toEqual('job-status-id');
      expect(outboxJobStatus.status).toEqual('pending');
      expect(outboxJobStatus.accountId).toEqual('account-id');
      expect(outboxJobStatus.originalData.to.length).toBe(1);
      expect(outboxJobStatus.originalData.to[0].name).toEqual('me');
      expect(outboxJobStatus.originalData.to[0].email).toEqual(
        'test@email.com'
      );
      expect(outboxJobStatus.originalData.subject).toEqual('This is an email');
      expect(outboxJobStatus.originalData.sendAt).toEqual(
        new Date(1646245940 * 1000)
      );
      expect(outboxJobStatus.originalData.originalSendAt).toEqual(
        new Date(1646245940 * 1000)
      );
      expect(outboxJobStatus.originalData.retryLimitDatetime).toEqual(
        new Date(1646332340 * 1000)
      );
    });

    test('should deserialize SendGridVerifiedStatus properly', () => {
      const json = {
        domain_verified: true,
        sender_verified: true,
      };

      const verificationStatus = new SendGridVerifiedStatus().fromJSON(json);
      expect(verificationStatus.domainVerified).toBe(true);
      expect(verificationStatus.senderVerified).toBe(true);
    });
  });

  describe('sendGrid', () => {
    beforeEach(() => {
      jest.spyOn(testContext.connection, 'request');

      const response = () => {
        return {
          status: 200,
          clone: () => response(),
          text: () => {
            return Promise.resolve({});
          },
          json: () => {
            return Promise.resolve({
              results: {
                domain_verified: true,
                sender_verified: true,
              },
            });
          },
          headers: new Map(),
        };
      };

      fetch.mockImplementation(() => Promise.resolve(response()));
    });

    test('should do a GET request for getting sendGrid verification', done => {
      return testContext.connection.outbox
        .sendGridVerificationStatus()
        .then(() => {
          const options = testContext.connection.request.mock.calls[0][0];
          expect(options.url.toString()).toEqual(
            'https://api.nylas.com/v2/outbox/onboard/verified_status'
          );
          expect(options.method).toEqual('GET');
          done();
        });
    });

    test('should do a DELETE request for delete sendGrid user', done => {
      return testContext.connection.outbox
        .deleteSendGridSubUser('user@email.com')
        .then(() => {
          const options = testContext.connection.request.mock.calls[0][0];
          expect(options.url.toString()).toEqual(
            'https://api.nylas.com/v2/outbox/onboard/subuser'
          );
          expect(options.method).toEqual('DELETE');
          expect(JSON.parse(options.body)).toEqual({
            email: 'user@email.com',
          });
          done();
        });
    });
  });

  describe('Date Validation', () => {
    test('Setting sendAt to older than today throws an error', done => {
      expect(() =>
        testContext.connection.outbox.update('string', {
          sendAt: 636309514, // 1990
        })
      ).toThrow();
      done();
    });

    test('Setting retryLimitDatetime to older than sendAt', done => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      expect(() =>
        testContext.connection.outbox.update('string', {
          sendAt: dayAfter,
          retryLimitDatetime: tomorrow,
        })
      ).toThrow();
      done();
    });

    test('Setting retryLimitDatetime to older than today without sendAt date', done => {
      expect(() =>
        testContext.connection.outbox.update('string', {
          retryLimitDatetime: 636309514, // 1990
        })
      ).toThrow();
      done();
    });
  });
});
