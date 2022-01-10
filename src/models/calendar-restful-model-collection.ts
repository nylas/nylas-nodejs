import Calendar from './calendar';
import NylasConnection from '../nylas-connection';
import RestfulModelCollection from './restful-model-collection';
import FreeBusy, { FreeBusyQuery } from './free-busy';
import CalendarAvailability, {
  CalendarConsecutiveAvailability, ConsecutiveAvailabilityQuery,
  OpenHours, SingleAvailabilityQuery,
} from './calendar-availability';

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

  freeBusy(
    options: FreeBusyQuery,
    callback?: (error: Error | null, data?: Record<string, unknown>) => void
  ): Promise<FreeBusy[]> {
    return this.connection
      .request({
        method: 'POST',
        path: `/calendars/free-busy`,
        body: {
          start_time: options.startTime.toString(),
          end_time: options.endTime.toString(),
          emails: options.emails,
        },
      })
      .then(json => {
        if (callback) {
          callback(null, json);
        }
        const freeBusy = [];
        for (const fb of JSON.parse(json)) {
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

  //TODO::Enum for date?
  availability(
    options: SingleAvailabilityQuery,
    callback?: (error: Error | null, data?: Record<string, any>) => void
  ): Promise<CalendarAvailability> {
    // Instantiate objects from properties to get JSON formatted for the API call
    const freeBusyJson = options.freeBusy
      ? options.freeBusy.map(fb => new FreeBusy(fb).toJSON(true))
      : [];
    const openHoursJson = options.openHours
      ? options.openHours.map(oh => new OpenHours(oh).toJSON(true))
      : [];

    return this.connection
      .request({
        method: 'POST',
        path: `/calendars/availability`,
        body: {
          emails: options.emails,
          duration_minutes: options.duration,
          interval_minutes: options.interval,
          start_time: options.startTime,
          end_time: options.endTime,
          buffer: options.buffer,
          tentative_busy: options.tentativeBusy,
          round_robin: options.roundRobin,
          free_busy: freeBusyJson,
          open_hours: openHoursJson,
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

    // Instantiate objects from properties to get JSON formatted for the API call
    const freeBusyJson = options.freeBusy
      ? options.freeBusy.map(fb => new FreeBusy(fb).toJSON(true))
      : [];
    const openHoursJson = options.openHours
      ? options.openHours.map(oh => new OpenHours(oh).toJSON(true))
      : [];

    return this.connection
      .request({
        method: 'POST',
        path: `/calendars/availability/consecutive`,
        body: {
          emails: options.emails,
          duration_minutes: options.duration,
          interval_minutes: options.interval,
          start_time: options.startTime,
          end_time: options.endTime,
          buffer: options.buffer,
          tentative_busy: options.tentativeBusy,
          free_busy: freeBusyJson,
          open_hours: openHoursJson,
        },
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
}
