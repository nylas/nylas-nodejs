import Calendar from './calendar';
import NylasConnection from '../nylas-connection';
import RestfulModelCollection from './restful-model-collection';

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
    options: {
      start_time?: string;
      startTime?: string;
      end_time?: string;
      endTime?: string;
      emails: string[];
    },
    callback?: (error: Error | null, data?: { [key: string]: any }) => void
  ) {
    return this.connection
      .request({
        method: 'POST',
        path: `/calendars/free-busy`,
        body: {
          start_time: options.startTime || options.start_time,
          end_time: options.endTime || options.end_time,
          emails: options.emails,
        },
      })
      .then(json => {
        if (callback) {
          callback(null, json);
        }
        return Promise.resolve(json);
      })
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }

  availability(
    options: {
      emails: string[];
      duration: number;
      interval: number;
      start_time?: string;
      startTime?: string;
      end_time?: string;
      endTime?: string;
      free_busy?: Array<{
        emails: string;
        object: string;
        time_slots: Array<{
          object: string;
          status: string;
          start_time: string;
          end_time: string;
        }>;
      }>;
      open_hours: Array<{
        emails: string[];
        days: string[];
        timezone: string;
        start: string;
        end: string;
        object_type: string;
      }>;
    },
    callback?: (error: Error | null, data?: { [key: string]: any }) => void
  ) {
    return this.connection
      .request({
        method: 'POST',
        path: `/calendars/availability`,
        body: {
          emails: options.emails,
          duration_minutes: options.duration,
          interval_minutes: options.interval,
          start_time: options.startTime || options.start_time,
          end_time: options.endTime || options.end_time,
          free_busy: options.free_busy || [],
          open_hours: options.open_hours,
        },
      })
      .then(json => {
        if (callback) {
          callback(null, json);
        }
        return Promise.resolve(json);
      })
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }

  consecutiveAvailability(
    options: {
      emails: Array<string[]>;
      duration: number;
      interval: number;
      start_time?: number;
      startTime?: number;
      end_time?: number;
      endTime?: number;
      buffer?: number;
      free_busy?: Array<{
        email: string;
        object: string;
        time_slots: Array<{
          object: string;
          status: string;
          start_time: number;
          end_time: number;
        }>;
      }>;
      open_hours: Array<{
        emails: string[];
        days: number[];
        timezone: string;
        start: string;
        end: string;
        object_type: string;
      }>;
    },
    callback?: (error: Error | null, data?: { [key: string]: any }) => void
  ) {
    const freeBusyEmails = options.free_busy
      ? options.free_busy.map(freeBusy => freeBusy.email)
      : [];
    for (const openHour of options.open_hours) {
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

    return this.connection
      .request({
        method: 'POST',
        path: `/calendars/availability/consecutive`,
        body: {
          emails: options.emails,
          duration_minutes: options.duration,
          interval_minutes: options.interval,
          start_time: options.startTime || options.start_time,
          end_time: options.endTime || options.end_time,
          buffer: options.buffer,
          free_busy: options.free_busy || [],
          open_hours: options.open_hours,
        },
      })
      .then(json => {
        if (callback) {
          callback(null, json);
        }
        return Promise.resolve(json);
      })
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }
}
