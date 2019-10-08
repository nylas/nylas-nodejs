import RestfulModel from './restful-model';
import Attributes from './attributes';
import EventParticipant from './event-participant';

export default class Event extends RestfulModel {
  get start() {
    return
      this.when.start_time ||
      this.when.start_date ||
      this.when.time ||
      this.when.date;
  }

  get end() {
    return
      this.when.end_time ||
      this.when.end_date ||
      this.when.time ||
      this.when.date;
  }

  set start(val) {
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

  set end(val) {
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

  deleteRequestQueryString(params) {
    var qs = {};
    if (params.hasOwnProperty('notify_participants')) {
      qs.notify_participants = params.notify_participants;
    }
    return qs;
  }

  save(params = {}, callback = null) {
    return this._save(params, callback);
  }

  fromJSON(json) {
    super.fromJSON(json);

    if (this.when) {
      delete this.when.object;
    }
    return this;
  }

  rsvp(status, comment, callback) {
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
