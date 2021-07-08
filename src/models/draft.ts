import Message from './message';
import Attributes from './attributes';
import { SaveCallback } from './restful-model';

export type SendCallback = (
  err: Error | null,
  json?: { [key: string]: any }
) => void;

export default class Draft extends Message {
  rawMime?: string;
  replyToMessageId?: string;
  version?: number;

  toJSON(enforceReadOnly?: boolean) {
    if (this.rawMime) {
      throw Error('toJSON() cannot be called for raw MIME drafts');
    }
    const json = super.toJSON(enforceReadOnly);
    json.file_ids = super.fileIds();

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
    trackingArg?: { [key: string]: any } | SendCallback | null,
    callbackArg?: SendCallback | { [key: string]: any } | null
  ) {
    // callback used to be the first argument, and tracking was the second
    let callback: SendCallback | undefined;
    if (typeof callbackArg === 'function') {
      callback = callbackArg as SendCallback;
    } else if (typeof trackingArg === 'function') {
      callback = trackingArg as SendCallback;
    }
    let tracking: { [key: string]: any } | undefined;
    if (trackingArg && typeof trackingArg === 'object') {
      tracking = trackingArg;
    } else if (callbackArg && typeof callbackArg === 'object') {
      tracking = callbackArg;
    }

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
      }
      if (tracking) {
        body['tracking'] = tracking;
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
