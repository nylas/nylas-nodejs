import fetchMock from 'jest-fetch-mock';
import APIClient from '../../src/apiClient';
import { Events } from '../../src/resources/events';
import type {
  CreateEventRequest,
  EventResource,
  UpdateEventRequest,
} from '../../src/nylas';

type Assert<T extends true> = T;
// UpdateEventRequest uses a recursive partial for other fields, but each resource
// must still identify its email address when replacing the resources array.
type UpdateResource = NonNullable<UpdateEventRequest['resources']>[number];
type _ResourceEmailRequired = Assert<
  object extends Pick<EventResource, 'email'> ? false : true
>;
type _UpdateResourceEmailRequired = Assert<
  object extends Pick<UpdateResource, 'email'> ? false : true
>;
type _NumericFloorNumber = Assert<
  string extends NonNullable<EventResource['floorNumber']> ? false : true
>;

describe('Event resources', () => {
  const resources: EventResource[] = [
    {
      email: 'room@example.com',
      name: 'Conference Room A',
      capacity: 10,
      building: 'HQ',
      floorName: 'Second Floor',
      floorSection: 'East Wing',
      floorNumber: 2,
    },
    { email: 'projector@example.com' },
  ];
  const wireResources = [
    {
      email: 'room@example.com',
      name: 'Conference Room A',
      capacity: 10,
      building: 'HQ',
      floor_name: 'Second Floor',
      floor_section: 'East Wing',
      floor_number: 2,
    },
    { email: 'projector@example.com' },
  ];
  const eventJson = {
    id: 'event-fixture',
    grant_id: 'grant-fixture',
    calendar_id: 'calendar-fixture',
    object: 'event',
    busy: true,
    read_only: false,
    participants: [],
    visibility: 'public',
    when: { time: 1719343231, timezone: 'UTC', object: 'time' },
  };
  const queryParams = { calendarId: 'calendar-fixture' };
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

  it('creates an event with typed resources and converts nested fields', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ data: { ...eventJson, resources: wireResources } })
    );
    const requestBody: CreateEventRequest = {
      when: { time: 1719343231, timezone: 'UTC' },
      resources,
    };

    const response = await events.create({
      identifier: 'grant-fixture',
      queryParams,
      requestBody,
    });

    const request = fetchMock.mock.calls[0][0] as Request;
    expect(request.method).toBe('POST');
    expect(JSON.parse(await request.text()).resources).toEqual(wireResources);
    expect(response.data.resources).toEqual(resources);
  });

  it('updates resources without requiring other event fields', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ data: { ...eventJson, resources: wireResources } })
    );
    const requestBody: UpdateEventRequest = { resources };

    const response = await events.update({
      identifier: 'grant-fixture',
      eventId: 'event-fixture',
      queryParams,
      requestBody,
    });

    const request = fetchMock.mock.calls[0][0] as Request;
    expect(request.method).toBe('PUT');
    expect(JSON.parse(await request.text())).toEqual({
      resources: wireResources,
    });
    expect(response.data.resources).toEqual(resources);
  });

  it('sends an empty resources array to clear existing resources', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ data: { ...eventJson, resources: [] } })
    );

    const response = await events.update({
      identifier: 'grant-fixture',
      eventId: 'event-fixture',
      queryParams,
      requestBody: { resources: [] },
    });

    const request = fetchMock.mock.calls[0][0] as Request;
    expect(JSON.parse(await request.text())).toEqual({ resources: [] });
    expect(response.data.resources).toEqual([]);
  });

  it('omits resources when updating unrelated event fields', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: eventJson }));

    const response = await events.update({
      identifier: 'grant-fixture',
      eventId: 'event-fixture',
      queryParams,
      requestBody: { title: 'Updated title' },
    });

    const request = fetchMock.mock.calls[0][0] as Request;
    expect(JSON.parse(await request.text())).toEqual({
      title: 'Updated title',
    });
    expect(response.data.resources).toBeUndefined();
  });

  it('reads resources from a single event', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ data: { ...eventJson, resources: wireResources } })
    );

    const response = await events.find({
      identifier: 'grant-fixture',
      eventId: 'event-fixture',
      queryParams,
    });

    expect(response.data.resources).toEqual(resources);
  });

  it('reads resources from listed events', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ data: [{ ...eventJson, resources: wireResources }] })
    );

    const response = await events.list({
      identifier: 'grant-fixture',
      queryParams,
    });

    expect(response.data[0].resources).toEqual(resources);
  });
});
