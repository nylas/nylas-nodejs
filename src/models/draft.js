const _ = require('underscore');
const Promise = require('bluebird');

const File = require('./file');
const Message = require('./message');
const Contact = require('./contact');
const Attributes = require('./attributes');

export class Draft extends Message {
  constructor(...args) {
    super(...args);
    this.save = this.save.bind(this);
    this.collectionName = 'drafts';
    this.attributes = _.extend({}, Message.attributes, {
      replyToMessageId: Attributes.String({
        modelKey: 'replyToMessageId',
        jsonKey: 'reply_to_message_id',
      }),
    });
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
