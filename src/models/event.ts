import RestfulModel, { SaveCallback } from './restful-model';
import Attributes from './attributes';
import EventParticipant from './event-participant';

export default class Event extends RestfulModel {
  calendarId?: string;
  iCalUID?: string;
  messageId?: string;
  title?: string;
  description?: string;
  owner?: string;
  participants?: EventParticipant[];
  readOnly?: boolean;
  location?: string;
  when?: {
    start_time?: number;
    end_time?: number;
    time?: number;
    start_date?: string;
    end_date?: string;
    date?: string;
    object?: string;
  };
  busy?: boolean;
  status?: string;

  get start() {
    const start =
      this.when?.start_time ||
      this.when?.start_date ||
      this.when?.time ||
      this.when?.date;
    return start;
  }

  set start(val: string | number | undefined) {
    if (this.when) {
      if (typeof val === 'number') {
        if (val === this.when.end_time) {
          this.when = { time: val };
        } else {
          delete this.when.time;
          delete this.when.start_date;
          delete this.when.date;
          this.when.start_time = val;
        }
      }
      if (typeof val === 'string') {
        if (val === this.when.end_date) {
          this.when = { date: val };
        } else {
          delete this.when.date;
          delete this.when.start_time;
          delete this.when.time;
          this.when.start_date = val;
        }
      }
    }
  }

  get end() {
    const end =
      this.when?.end_time ||
      this.when?.end_date ||
      this.when?.time ||
      this.when?.date;
    return end;
  }

  set end(val: string | number | undefined) {
    if (this.when) {
      if (typeof val === 'number') {
        if (val === this.when.start_time) {
          this.when = { time: val };
        } else {
          delete this.when.time;
          delete this.when.end_date;
          delete this.when.date;
          this.when.end_time = val;
        }
      }
      if (typeof val === 'string') {
        if (val === this.when.start_date) {
          this.when = { date: val };
        } else {
          delete this.when.date;
          delete this.when.time;
          delete this.when.end_time;
          this.when.end_date = val;
        }
      }
    }
  }

  deleteRequestQueryString(params: { [key: string]: any } = {}) {
    const qs: { [key: string]: any } = {};
    if (params.hasOwnProperty('notify_participants')) {
      qs.notify_participants = params.notify_participants;
    }
    return qs;
  }

  save(params: {} | SaveCallback = {}, callback?: SaveCallback) {
    return this._save(params, callback);
  }

  fromJSON(json: { [key: string]: any }) {
    super.fromJSON(json);

    if (this.when) {
      delete this.when.object;
    }
    return this;
  }

  rsvp(status: string, comment: string, callback: (error: Error | null, data?: Event) => void) {
    return this.connection
      .request({
        method: 'POST',
        body: { event_id: this.id, status: status, comment: comment },
        path: '/send-rsvp',
      })
      .then(json => {
        this.fromJSON(json);
        if (callback) {
          callback(null, this);
        }
        return Promise.resolve(this);
      })
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }
}
Event.collectionName = 'events';
Event.attributes = {
  ...RestfulModel.attributes,
  calendarId: Attributes.String({
    modelKey: 'calendarId',
    jsonKey: 'calendar_id',
  }),
  iCalUID: Attributes.String({
    modelKey: 'iCalUID',
    jsonKey: 'ical_uid',
  }),
  messageId: Attributes.String({
    modelKey: 'messageId',
    jsonKey: 'message_id',
  }),
  title: Attributes.String({
    modelKey: 'title',
  }),
  description: Attributes.String({
    modelKey: 'description',
  }),
  owner: Attributes.String({
    modelKey: 'owner',
  }),
  participants: Attributes.Collection({
    modelKey: 'participants',
    itemClass: EventParticipant,
  }),
  readOnly: Attributes.Boolean({
    modelKey: 'readOnly',
    jsonKey: 'read_only',
  }),
  location: Attributes.String({
    modelKey: 'location',
  }),
  when: Attributes.Object({
    modelKey: 'when',
  }),
  busy: Attributes.Boolean({
    modelKey: 'busy',
  }),
  status: Attributes.String({
    modelKey: 'status',
  }),
};
