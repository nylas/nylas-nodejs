import APIClient from '../../src/apiClient';
import { MessageFields } from '../../src/models/messages';
import { TransactionalSend } from '../../src/resources/transactionalSend';
import { createReadableStream } from '../testUtils';

jest.mock('../../src/apiClient');

describe('TransactionalSend', () => {
  let apiClient: jest.Mocked<APIClient>;
  let transactionalSend: TransactionalSend;

  beforeEach(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    transactionalSend = new TransactionalSend(apiClient);
    apiClient.request.mockResolvedValue({
      data: { messageId: '6c45fe5e-0bb6-41b9-9acc-ccb15bfc51eb' },
    });
  });

  describe('send', () => {
    it('should call apiClient.request with the correct params', async () => {
      const requestBody = {
        to: [{ name: 'Jane Doe', email: 'jane.doe@example.com' }],
        from: [{ name: 'ACME Support', email: 'support@acme.com' }],
        subject: 'Welcome to ACME',
        body: "Welcome to ACME! We're here to help you.",
      };

      await transactionalSend.send({
        domainName: 'acme.com',
        requestBody,
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: {
            'Idempotency-Key': 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          },
        },
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];
      expect(capturedRequest.method).toEqual('POST');
      expect(capturedRequest.path).toEqual(
        '/v3/domains/acme.com/messages/send'
      );
      expect(capturedRequest.body).toEqual(requestBody);
      expect(capturedRequest.overrides).toEqual({
        apiUri: 'https://test.api.nylas.com',
        headers: { 'Idempotency-Key': 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
      });
    });

    it('should URL-encode the domain name in the path', async () => {
      await transactionalSend.send({
        domainName: 'my-app.nylas.email',
        requestBody: {
          to: [{ email: 'jane.doe@example.com' }],
          from: [{ email: 'support@my-app.nylas.email' }],
          subject: 'Test',
          body: 'Hello',
        },
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];
      expect(capturedRequest.path).toEqual(
        '/v3/domains/my-app.nylas.email/messages/send'
      );
    });

    it('should encode attachments under 3mb as base64 in the JSON body', async () => {
      const baseJson = {
        to: [{ email: 'test@example.com' }],
        from: [{ email: 'support@acme.com' }],
        subject: 'Attachment test',
      };
      const requestBody = {
        ...baseJson,
        attachments: [
          {
            filename: 'file1.txt',
            contentType: 'text/plain',
            content: createReadableStream('This is the text from file 1'),
            size: 100,
          },
        ],
      };
      const expectedBody = {
        ...baseJson,
        attachments: [
          {
            filename: 'file1.txt',
            contentType: 'text/plain',
            content: 'VGhpcyBpcyB0aGUgdGV4dCBmcm9tIGZpbGUgMQ==',
            size: 100,
          },
        ],
      };

      await transactionalSend.send({
        domainName: 'acme.com',
        requestBody,
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];
      expect(capturedRequest.body).toEqual(expectedBody);
      expect(capturedRequest.form).toBeUndefined();
    });

    it('should pass query params through to the request', async () => {
      await transactionalSend.send({
        domainName: 'acme.com',
        requestBody: {
          to: [{ email: 'test@example.com' }],
          from: [{ email: 'support@acme.com' }],
          subject: 'Test',
        },
        queryParams: {
          fields: MessageFields.INCLUDE_HEADERS,
        },
      });

      const capturedRequest = apiClient.request.mock.calls[0][0];
      expect(capturedRequest.queryParams).toEqual({
        fields: MessageFields.INCLUDE_HEADERS,
      });
    });
  });
});
