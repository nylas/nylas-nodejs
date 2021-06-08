import Calendar from './calendar';
import NylasConnection from '../nylas-connection';
import RestfulModel from './restful-model';
import RestfulModelCollection from './restful-model-collection';

export default class CalendarRestfulModelCollection extends RestfulModelCollection<Calendar> {
  connection: NylasConnection;
  modelClass: typeof Calendar;

  constructor(connection: NylasConnection) {
    super(Calendar, connection);
    this.connection = connection;
    this.modelClass = Calendar;
  }

  freeBusy(options: {
    start_time?: string,
    startTime?: string,
    end_time?: string,
    endTime?: string,
    emails: string[]
  }, callback?: (error: Error | null, data?: { [key: string]: any }) => void) {

    return this.connection
      .request({
        method: 'POST',
        path: `/calendars/free-busy`,
        body: {
          start_time: options.startTime || options.start_time,
          end_time: options.endTime || options.end_time,
          emails: options.emails
        }
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
