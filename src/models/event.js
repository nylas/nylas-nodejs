import RestfulModel from './restful-model';
import Attributes from './attributes';
import EventParticipant from './event-participant';

export default class Event extends RestfulModel {
  static set when(when) {
    this.start =
      when.start_time ||
      when.start_date ||
      when.time ||
      when.date;
    this.end =
      when.end_time ||
      when.end_date ||
      when.time ||
      when.date;
  }

  static set start(val) {
    console.log('typeof val: ', typeof val)
    if (typeof val === 'number') {
      if (val === this.end) {
        this.when = {
          time: val,
        }
      } else {
        this.when.start_time = val;
      }
    }  
    if (typeof val === 'string') {
      if (val === this.end) {
        this.when = {
          date: val,
        }
      } else {
        this.when.start_date = val;
      }
    }
  }

  static set end(val) {
    if (typeof val === 'number') {
      if (this.start === val) {
        this.when = {
          time: val,
        }
      } else {
        this.when.end_time = val;
      }
    }  
    if (typeof val === 'string') {
      if (this.start === val) {
        this.when = {
          date: val,
        }
      } else {
        this.when.end_date = val;
      }
    }
  }

  saveRequestBody() {
    const dct = this.toJSON();
    delete dct['_start'];
    delete dct['_end'];
    return dct;
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
      this.start =
        this.when.start_time ||
        this.when.start_date ||
        this.when.time ||
        this.when.date;
      this.end =
        this.when.end_time ||
        this.when.end_date ||
        this.when.time ||
        this.when.date;
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
  start: Attributes.NumberOrString({
    modelKey: 'start',
    jsonKey: '_start',
  }),
  end: Attributes.NumberOrString({
    modelKey: 'end',
    jsonKey: '_end',
  }),
  busy: Attributes.Boolean({
    modelKey: 'busy',
  }),
  status: Attributes.String({
    modelKey: 'status',
  }),
};
