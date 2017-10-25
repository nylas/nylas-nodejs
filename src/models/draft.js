import _ from 'underscore';
import Promise from 'bluebird';

import File from './file';
import Message from './message';
import Contact from './contact';
import Attributes from './attributes';

export default class Draft extends Message {
  constructor(...args) {
    super(...args);
    this.save = this.save.bind(this);
  }

  toJSON() {
    if (this.rawMime) {
      throw Error('toJSON() cannot be called for raw MIME drafts');
    }
    const json = super.toJSON(...arguments);
    json.file_ids = this.fileIds();
    if (this.draft) {
      json.object = 'draft';
    }
    return json;
  }

  save(params = {}, callback = null) {
    if (this.rawMime) {
      const err = new Error('save() cannot be called for raw MIME drafts');
      if (callback) {
        callback(err);
      }
      return Promise.reject(err);
    }
    return this._save(params, callback);
  }

  saveRequestBody() {
    if (this.rawMime) {
      throw Error('saveRequestBody() cannot be called for raw MIME drafts');
    }
    return super.saveRequestBody(...arguments);
  }

  toString() {
    if (this.rawMime) {
      throw Error('toString() cannot be called for raw MIME drafts');
    }
    super.toString();
  }

  send(callback = null) {
    let body = this.rawMime,
      headers = { 'Content-Type': 'message/rfc822' },
      json = false;

    if (!this.rawMime) {
      headers = {};
      json = true;
      if (this.id) {
        body = {
          draft_id: this.id,
          version: this.version,
        };
      } else {
        body = this.saveRequestBody();
      }
    }

    return this.connection
      .request({
        method: 'POST',
        path: '/send',
        headers,
        body,
        json,
      })
      .then(json => {
        const message = new Message(this.connection, json);
        if (callback) {
          callback(null, message);
        }
        return Promise.resolve(message);
      })
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }
}
Draft.collectionName = 'drafts';
Draft.attributes = _.extend({}, Message.attributes, {
  replyToMessageId: Attributes.String({
    modelKey: 'replyToMessageId',
    jsonKey: 'reply_to_message_id',
  }),
});
