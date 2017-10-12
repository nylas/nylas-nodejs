const RestfulModel = require('./restful-model');
const Attributes = require('./attributes');
const Participant = require('./participant');
const Promise = require('bluebird');
const _ = require('underscore');

export class Event extends RestfulModel {
  constructor(...args) {
    super(...args);
    this.save = this.save.bind(this);
    this.collectionName = 'events';
    this.attributes = _.extend({}, RestfulModel.attributes, {
      calendarId: Attributes.String({
        modelKey: 'calendarId',
        jsonKey: 'calendar_id',
      }),
      busy: Attributes.Boolean({
        modelKey: 'busy',
      }),
      title: Attributes.String({
        modelKey: 'title',
      }),
      description: Attributes.String({
        modelKey: 'description',
      }),
      status: Attributes.String({
        modelKey: 'status',
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
      participants: Attributes.Collection({
        modelKey: 'participants',
        itemClass: Participant,
      }),
    });
  }

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

  save(params, callback = null) {
    if (!params) {
      params = {};
    }
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
      .catch(function(err) {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }
}
