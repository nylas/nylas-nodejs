import fetchMock from 'jest-fetch-mock';
import APIClient from '../../src/apiClient';
import { Events } from '../../src/resources/events';
import {
  BatchEventOperation,
  BatchEventsQueryParams,
  BatchEventsRequest,
  BatchEventsResponse,
  Event,
  NylasApiError,
} from '../../src/nylas';

// These assignments are checked by ts-jest as part of the test suite.
// @ts-expect-error A create operation needs an event body.
const createWithoutBody: BatchEventOperation = { method: 'create' };
// @ts-expect-error An update operation needs an event ID.
const updateWithoutId: BatchEventOperation = {
  method: 'update',
  body: { title: 'Renamed' },
};
// @ts-expect-error An update operation needs a body.
const updateWithoutBody: BatchEventOperation = {
  method: 'update',
  eventId: 'event-updated',
};
// @ts-expect-error A delete operation needs an event ID.
const deleteWithoutId: BatchEventOperation = { method: 'delete' };
const invalidMethod: BatchEventOperation = {
  // @ts-expect-error Batch operations use a literal method allow-list.
  method: 'patch',
  eventId: 'event',
};
// @ts-expect-error Every batch must identify a calendar.
const queryWithoutCalendar: BatchEventsQueryParams = {};
void createWithoutBody;
void updateWithoutId;
void updateWithoutBody;
void deleteWithoutId;
void invalidMethod;
void queryWithoutCalendar;

describe('Events batch', () => {
  const metadata = { externalRecordId: 'record-fixture', custom_key: 'value' };
  const eventJson = {
    id: 'event-created',
    grant_id: 'grant-fixture',
    calendar_id: 'primary',
    object: 'event',
    busy: true,
    read_only: false,
    participants: [],
    visibility: 'public',
    when: {
      start_time: 1798794000,
      end_time: 1798795800,
      object: 'timespan',
    },
    metadata,
  };
  const requestBody: BatchEventsRequest = {
    operations: [
      {
        method: 'create',
        body: {
          title: 'Standup',
          when: { startTime: 1798794000, endTime: 1798795800 },
          hideParticipants: true,
          metadata,
        },
      },
      {
        method: 'update',
        eventId: 'event-updated',
        body: { title: 'Renamed' },
      },
      { method: 'delete', eventId: 'event-deleted' },
    ],
  };
  const queryParams = { calendarId: 'primary' };
  let events: Events;

  beforeEach(() => {
    fetchMock.resetMocks();
    events = new Events(
      new APIClient({
        apiKey: '',
        apiUri: 'https://example.invalid',
        timeout: 30,
        headers: {},
      })
    );
  });

  it.each([
    undefined,
    null,
    123,
    {},
    '',
    ' \t\n',
    '.',
    '..',
    '%2e',
    '%2E%2e',
    '.%2e',
    '%2e.',
  ])(
    'rejects an invalid grant identifier before sending HTTP: %p',
    (identifier) => {
      expect(() =>
        events.batch({
          identifier: identifier as unknown as string,
          queryParams,
          requestBody,
        })
      ).toThrow(new TypeError('Invalid grant identifier.'));
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it('sends all operations and shared query parameters with wire casing and overrides', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ request_id: 'request-fixture', data: [] })
    );

    await events.batch({
      identifier: 'grant/fixture',
      queryParams: {
        ...queryParams,
        notifyParticipants: false,
        tentativeAsBusy: false,
        grantEmail: 'grant@example.com',
        select: 'id,title',
      },
      requestBody,
      overrides: {
        apiUri: 'https://override.example.invalid',
        headers: { 'X-Custom-Header': 'batch-fixture' },
      },
    });

    const request = fetchMock.mock.calls[0][0] as Request;
    const url = new URL(request.url);
    expect(request.method).toBe('POST');
    expect(url.origin).toBe('https://override.example.invalid');
    expect(url.pathname).toBe('/v3/grants/grant%2Ffixture/events/batch');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      calendar_id: 'primary',
      notify_participants: 'false',
      tentative_as_busy: 'false',
      grant_email: 'grant@example.com',
      select: 'id,title',
    });
    expect(request.headers.get('x-custom-header')).toBe('batch-fixture');
    expect(request.headers.get('content-type')).toBe('application/json');
    expect(JSON.parse(await request.text())).toEqual({
      operations: [
        {
          method: 'create',
          body: {
            title: 'Standup',
            when: { start_time: 1798794000, end_time: 1798795800 },
            hide_participants: true,
            metadata,
          },
        },
        {
          method: 'update',
          event_id: 'event-updated',
          body: { title: 'Renamed' },
        },
        { method: 'delete', event_id: 'event-deleted' },
      ],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns typed create/update events and an empty delete result in request order for 200', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        request_id: 'request-fixture',
        data: [
          { status: 200, data: eventJson },
          {
            status: 200,
            data: { ...eventJson, id: 'event-updated', title: 'Renamed' },
          },
          { status: 200 },
        ],
      }),
      { status: 200 }
    );

    const result: BatchEventsResponse = await events.batch({
      identifier: 'grant-fixture',
      queryParams,
      requestBody,
    });
    const createdEvent: Event | undefined = result.data[0].data;
    expect(result.requestId).toBe('request-fixture');
    expect(result.data).toHaveLength(requestBody.operations.length);
    expect(result.data.map((item) => item.data?.id)).toEqual([
      'event-created',
      'event-updated',
      undefined,
    ]);
    expect(createdEvent?.grantId).toBe('grant-fixture');
    expect(createdEvent?.readOnly).toBe(false);
    expect(createdEvent?.when).toEqual({
      startTime: 1798794000,
      endTime: 1798795800,
      object: 'timespan',
    });
    expect(createdEvent?.metadata).toEqual(metadata);
    expect(result.data[1].data?.title).toBe('Renamed');
    expect(result.data[2].data).toBeUndefined();
    expect(result).not.toHaveProperty('nextCursor');
    const request = fetchMock.mock.calls[0][0] as Request;
    expect(new URL(request.url).searchParams.has('notify_participants')).toBe(
      false
    );
  });

  it('returns mixed 207 results including provider errors and zero retry delay without retrying', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        request_id: 'request-mixed',
        data: [
          { status: 200, data: eventJson },
          {
            status: 503,
            error: {
              type: 'provider_error',
              message: 'Try again later',
              provider_error: { error_code: 'unavailable' },
            },
            retry_after: 0,
            provider_event_created: true,
          },
          {
            status: 404,
            error: { type: 'not_found_error', message: 'Event not found' },
          },
        ],
      }),
      { status: 207 }
    );

    const result = await events.batch({
      identifier: 'grant-fixture',
      queryParams,
      requestBody,
    });

    expect(result.requestId).toBe('request-mixed');
    expect(result.data.map((item) => item.status)).toEqual([200, 503, 404]);
    expect(result.data[1]).toEqual({
      status: 503,
      error: {
        type: 'provider_error',
        message: 'Try again later',
        providerError: { errorCode: 'unavailable' },
      },
      retryAfter: 0,
      providerEventCreated: true,
    });
    expect(result.data[2].error?.type).toBe('not_found_error');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns normally when every operation in a 207 response failed', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        request_id: 'request-failed',
        data: [
          {
            status: 429,
            error: { type: 'rate_limit_error', message: 'Slow down' },
            retry_after: 5,
          },
          {
            status: 503,
            error: { type: 'provider_error', message: 'Unavailable' },
          },
          {
            status: 404,
            error: { type: 'not_found_error', message: 'Event not found' },
          },
        ],
      }),
      { status: 207 }
    );

    const result = await events.batch({
      identifier: 'grant-fixture',
      queryParams,
      requestBody,
    });

    expect(result.requestId).toBe('request-failed');
    expect(result.data.map((item) => item.status)).toEqual([429, 503, 404]);
    expect(result.data[0].retryAfter).toBe(5);
    expect(result.data.every((item) => item.error !== undefined)).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws the standard API error for a rejected batch request', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        request_id: 'request-invalid',
        error: {
          type: 'invalid_request_error',
          message: 'Invalid batch request',
        },
      }),
      { status: 400, headers: { 'x-request-id': 'request-invalid' } }
    );

    const result = events.batch({
      identifier: 'grant-fixture',
      queryParams,
      requestBody: { operations: [] },
    });

    await expect(result).rejects.toBeInstanceOf(NylasApiError);
    await expect(result).rejects.toMatchObject({
      statusCode: 400,
      requestId: 'request-invalid',
      type: 'invalid_request_error',
      message: 'Invalid batch request',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
