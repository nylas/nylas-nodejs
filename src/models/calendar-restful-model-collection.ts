import Calendar, { CalendarProperties } from './calendar';
import NylasConnection from '../nylas-connection';
import RestfulModelCollection from './restful-model-collection';
import FreeBusy, { FreeBusyCalendar, FreeBusyQuery } from './free-busy';
import CalendarAvailability, {
  CalendarConsecutiveAvailability,
  ConsecutiveAvailabilityQuery,
  OpenHours,
  SingleAvailabilityQuery,
} from './calendar-availability';
import { MetadataQuery, RestfulQuery } from './model-collection';

export interface CalendarQuery extends RestfulQuery {
  metadata?: MetadataQuery;
}

export default class CalendarRestfulModelCollection extends RestfulModelCollection<
  Calendar
> {
  connection: NylasConnection;
  modelClass: typeof Calendar;

  constructor(connection: NylasConnection) {
    super(Calendar, connection);
    this.connection = connection;
    this.modelClass = Calendar;
  }

  create(
    props: CalendarProperties,
    callback?: (error: Error | null, result?: Calendar) => void
  ): Promise<Calendar> {
    return new Calendar(this.connection, props).save(callback);
  }

  list(
    params: CalendarQuery = {},
    callback?: (error: Error | null, obj?: Calendar[]) => void
  ): Promise<Calendar[]> {
    return super.list(this.formatQuery(params), callback);
  }

  freeBusy(
    options: FreeBusyQuery,
    callback?: (error: Error | null, data?: Record<string, unknown>) => void
  ): Promise<FreeBusy[]> {
    this.queryIsValid(options);

    const calendarsJson = options.calendars
      ? options.calendars.map(cal => new FreeBusyCalendar(cal).toJSON(true))
      : [];

    return this.connection
      .request({
        method: 'POST',
        path: `/calendars/free-busy`,
        body: {
          start_time: options.startTime.toString(),
          end_time: options.endTime.toString(),
          emails: options.emails || [],
          calendars: calendarsJson,
        },
      })
      .then(json => {
        if (callback) {
          callback(null, json);
        }
        const freeBusy = [];
        for (const fb of json) {
          freeBusy.push(new FreeBusy().fromJSON(fb));
        }
        return Promise.resolve(freeBusy);
      })
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }

  availability(
    options: SingleAvailabilityQuery,
    callback?: (error: Error | null, data?: Record<string, any>) => void
  ): Promise<CalendarAvailability> {
    this.queryIsValid(options);

    return this.connection
      .request({
        method: 'POST',
        path: `/calendars/availability`,
        body: {
          ...this.buildAvailabilityPayload(options),
          event_collection_id: options.eventCollectionId,
          round_robin: options.roundRobin,
        },
      })
      .then(json => {
        if (callback) {
          callback(null, json);
        }
        return Promise.resolve(new CalendarAvailability().fromJSON(json));
      })
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }

  consecutiveAvailability(
    options: ConsecutiveAvailabilityQuery,
    callback?: (error: Error | null, data?: { [key: string]: any }) => void
  ): Promise<CalendarConsecutiveAvailability> {
    this.queryIsValid(options);

    if (options.emails) {
      // If open hours contains any emails not present in the main emails key
      // or in the free busy email list as this would raise an error on the API side
      const freeBusyEmails = options.freeBusy
        ? options.freeBusy.map(fb => fb.email)
        : [];
      if (options.openHours) {
        for (const openHour of options.openHours) {
          for (const email of openHour.emails) {
            if (
              !options.emails.some(row => row.includes(email)) &&
              !freeBusyEmails.includes(email)
            ) {
              throw new Error(
                'Open Hours cannot contain an email not present in the main email list or the free busy email list.'
              );
            }
          }
        }
      }
    }

    return this.connection
      .request({
        method: 'POST',
        path: `/calendars/availability/consecutive`,
        body: this.buildAvailabilityPayload(options),
      })
      .then(json => {
        if (callback) {
          callback(null, json);
        }
        return Promise.resolve(
          new CalendarConsecutiveAvailability().fromJSON(json)
        );
      })
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }

  private buildAvailabilityPayload(
    options: SingleAvailabilityQuery | ConsecutiveAvailabilityQuery
  ): Record<string, unknown> {
    // Instantiate objects from properties to get JSON formatted for the API call
    const freeBusyJson = options.freeBusy
      ? options.freeBusy.map(fb => new FreeBusy(fb).toJSON(true))
      : [];
    const openHoursJson = options.openHours
      ? options.openHours.map(oh => new OpenHours(oh).toJSON(true))
      : [];
    const calendarsJson = options.calendars
      ? options.calendars.map(cal => new FreeBusyCalendar(cal).toJSON(true))
      : [];

    return {
      emails: options.emails,
      duration_minutes: options.duration,
      interval_minutes: options.interval,
      start_time: options.startTime,
      end_time: options.endTime,
      buffer: options.buffer,
      tentative_busy: options.tentativeBusy,
      free_busy: freeBusyJson,
      open_hours: openHoursJson,
      calendars: calendarsJson,
    };
  }

  // Helper function to check if a query is valid
  private queryIsValid(
    query:
      | FreeBusyQuery
      | SingleAvailabilityQuery
      | ConsecutiveAvailabilityQuery
  ): boolean {
    if (
      (!query.emails || query.emails.length == 0) &&
      (!query.calendars || query.calendars.length == 0)
    ) {
      throw new Error("Must set either 'emails' or 'calendars' in the query.");
    }
    return true;
  }

  protected formatQuery(query: CalendarQuery): Record<string, unknown> {
    return {
      ...super.formatQuery(query),
      metadata: this.formatMetadataQuery(query.metadata),
    };
  }
}
