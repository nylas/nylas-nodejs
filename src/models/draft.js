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
    const json = super.toJSON(...arguments);
    json.file_ids = this.fileIds();
    if (this.draft) {
      json.object = 'draft';
    }
    return json;
  }

  save(params, callback = null) {
    if (!params) {
      params = {};
    }
    return this._save(params, callback);
  }

  saveRequestBody() {
    return super.saveRequestBody(...arguments);
  }

  send(callback = null) {
    let body;
    if (this.id) {
      body = {
        draft_id: this.id,
        version: this.version,
      };
    } else {
      body = this.saveRequestBody();
    }

    return this.connection
      .request({
        method: 'POST',
        body,
        path: '/send',
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
