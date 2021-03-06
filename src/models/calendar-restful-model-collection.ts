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
}
