import Calendar from './calendar';
import NylasConnection from '../nylas-connection';
import RestfulModelCollection from './restful-model-collection';
import FreeBusy, { FreeBusyProperties } from './free-busy';
import CalendarAvailability, {
  OpenHoursProperties,
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
    options: {
      startTime: number;
      endTime: number;
      emails: string[];
    },
    callback?: (error: Error | null, data?: { [key: string]: any }) => void
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

  availability(
    options: {
      emails: string[];
      duration: number;
      interval: number;
      startTime: string;
      endTime: string;
      freeBusy?: FreeBusyProperties[];
      openHours?: OpenHoursProperties[];
    },
    callback?: (error: Error | null, data?: { [key: string]: any }) => void
  ): Promise<CalendarAvailability> {
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
          free_busy: options.freeBusy || [],
          open_hours: options.openHours || [],
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
}
