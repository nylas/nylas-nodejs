import {
  describe,
  it,
  expect,
  _beforeEach,
  beforeAll,
  _afterEach,
  _afterAll,
  vi,
} from 'vitest';
import APIClient from '../../src/apiClient';
import { Bookings } from '../../src/resources/bookings';

vi.mock('../../src/apiClient');

describe('Bookings', () => {
  let apiClient: any;
  let bookings: Bookings;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as any;

    bookings = new Bookings(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('create', () => {
    it('should call apiClient.request with the correct params', async () => {
      await bookings.create({
        queryParams: {
          configurationId: 'configuration123',
        },
        requestBody: {
          startTime: 1709643600,
          endTime: 1709645400,
          guest: {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
          },
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/scheduling/bookings',
        queryParams: {
          configurationId: 'configuration123',
        },
        body: {
          startTime: 1709643600,
          endTime: 1709645400,
          guest: {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
          },
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });
    });
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await bookings.find({
        bookingId: 'booking123',
        queryParams: {
          configurationId: 'configuration123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/scheduling/bookings/booking123',
        queryParams: {
          configurationId: 'configuration123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });
    });

    it('should URL encode bookingId in find', async () => {
      await bookings.find({
        bookingId: 'booking/123',
        queryParams: { configurationId: 'configuration123' },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/scheduling/bookings/booking%2F123',
        })
      );
    });

    it('should not double encode already-encoded bookingId in find', async () => {
      await bookings.find({
        bookingId: 'booking%2F123',
        queryParams: { configurationId: 'configuration123' },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/scheduling/bookings/booking%2F123',
        })
      );
    });
  });

  describe('confirm', () => {
    it('should call apiClient.request with the correct params', async () => {
      await bookings.confirm({
        bookingId: 'booking123',
        queryParams: {
          configurationId: 'configuration123',
        },
        requestBody: {
          salt: '_zgLLAuk_qtcsw',
          status: 'cancelled',
          cancellationReason: 'I am no longer available at this time.',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/scheduling/bookings/booking123',
        queryParams: {
          configurationId: 'configuration123',
        },
        body: {
          salt: '_zgLLAuk_qtcsw',
          status: 'cancelled',
          cancellationReason: 'I am no longer available at this time.',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });
    });

    it('should URL encode bookingId in confirm', async () => {
      await bookings.confirm({
        bookingId: 'booking/123',
        queryParams: { configurationId: 'configuration123' },
        requestBody: {
          salt: 'foo',
          status: 'cancelled',
          cancellationReason: 'bar',
        },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/scheduling/bookings/booking%2F123',
        })
      );
    });

    it('should not double encode already-encoded bookingId in confirm', async () => {
      await bookings.confirm({
        bookingId: 'booking%2F123',
        queryParams: { configurationId: 'configuration123' },
        requestBody: {
          salt: 'foo',
          status: 'cancelled',
          cancellationReason: 'bar',
        },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/scheduling/bookings/booking%2F123',
        })
      );
    });
  });

  describe('reschedule', () => {
    it('should call apiClient.request with the correct params', async () => {
      await bookings.reschedule({
        bookingId: 'booking123',
        queryParams: {
          configurationId: 'configuration123',
        },
        requestBody: {
          startTime: 1708714800,
          endTime: 1708722000,
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/v3/scheduling/bookings/booking123',
        queryParams: {
          configurationId: 'configuration123',
        },
        body: {
          startTime: 1708714800,
          endTime: 1708722000,
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });
    });

    it('should URL encode bookingId in reschedule', async () => {
      await bookings.reschedule({
        bookingId: 'booking/123',
        queryParams: { configurationId: 'configuration123' },
        requestBody: { startTime: 1, endTime: 2 },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/scheduling/bookings/booking%2F123',
        })
      );
    });

    it('should not double encode already-encoded bookingId in reschedule', async () => {
      await bookings.reschedule({
        bookingId: 'booking%2F123',
        queryParams: { configurationId: 'configuration123' },
        requestBody: { startTime: 1, endTime: 2 },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/scheduling/bookings/booking%2F123',
        })
      );
    });
  });

  describe('destroy', () => {
    it('should call apiClient.request with the correct params', async () => {
      await bookings.destroy({
        bookingId: 'booking123',
        queryParams: {
          configurationId: 'configuration123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/scheduling/bookings/booking123',
        queryParams: {
          configurationId: 'configuration123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'foobar' },
        },
      });
    });

    it('should URL encode bookingId in destroy', async () => {
      await bookings.destroy({
        bookingId: 'booking/123',
        queryParams: { configurationId: 'configuration123' },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/scheduling/bookings/booking%2F123',
        })
      );
    });

    it('should not double encode already-encoded bookingId in destroy', async () => {
      await bookings.destroy({
        bookingId: 'booking%2F123',
        queryParams: { configurationId: 'configuration123' },
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/scheduling/bookings/booking%2F123',
        })
      );
    });
  });
});
