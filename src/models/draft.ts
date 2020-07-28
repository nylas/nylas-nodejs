import File from './file';
import Message from './message';
import { Contact } from './contact';
import Attributes from './attributes';
import { SaveCallback } from './restful-model';

export default class Draft extends Message {
  rawMime?: string;
  replyToMessageId?: string;
  version?: number;

  toJSON() {
    if (this.rawMime) {
      throw Error('toJSON() cannot be called for raw MIME drafts');
    }
    const json = super.toJSON();
    json.file_ids = this.fileIds;
    json.object = 'draft';

    return json;
  }

  save(params: {} | SaveCallback = {}, callback?: SaveCallback) {
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
    return super.saveRequestBody();
  }

  deleteRequestBody(params: { [key: string]: any } = {}) {
    const body: { [key: string]: any } = {};
    body.version = params.hasOwnProperty('version')
      ? params.version
      : this.version;
    return body;
  }

  toString() {
    if (this.rawMime) {
      throw Error('toString() cannot be called for raw MIME drafts');
    }
    return super.toString();
  }

  send(
    callback?: (err: Error | null, json?: { [key: string]: any }) => void,
    tracking?: { [key: string]: any }
  ) {
    let body: any = this.rawMime,
      headers: { [key: string]: any } = { 'Content-Type': 'message/rfc822' },
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
        if (tracking) {
          body['tracking'] = tracking;
        }
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

        // We may get failures for a partial send
        if (json.failures) {
          message.failures = json.failures;
        }

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
Draft.attributes = {
  ...Message.attributes,
  version: Attributes.Number({
    modelKey: 'version',
  }),
  replyToMessageId: Attributes.String({
    modelKey: 'replyToMessageId',
    jsonKey: 'reply_to_message_id',
  }),
};
