import RestfulModel from './restful-model';
import Attributes from './attributes';
import EventParticipant from './event-participant';

export default class Event extends RestfulModel {
  saveRequestBody() {
    const dct = this.toJSON();
    if (this.start && this.end) {
      dct['when'] = {
        start_time: this.start.toString(),
        end_time: this.end.toString(),
      };
    }
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
      // For indexing and querying purposes, we flatten the start and end of the different
      // "when" formats into two timestamps we can use for range querying. Note that for
      // all-day events, we use first second of start date and last second of end date.
      this.start =
        this.when.start_time ||
        new Date(this.when.start_date).getTime() / 1000.0 ||
        this.when.time;
      this.end =
        this.when.end_time ||
        new Date(this.when.end_date).getTime() / 1000.0 + (60 * 60 * 24 - 1) ||
        this.when.time;
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
  start: Attributes.Number({
    modelKey: 'start',
    jsonKey: '_start',
  }),
  end: Attributes.Number({
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
