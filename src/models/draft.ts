import Message from './message';
import Attributes from './attributes';
import { SaveCallback } from './restful-model';

export default class Draft extends Message {
  rawMime?: string;
  version?: number;
  draft: boolean = true;

  toJSON(...args: Parameters<Message['toJSON']>) {
    if (this.rawMime) {
      throw Error('toJSON() cannot be called for raw MIME drafts');
    }
    const json = super.toJSON(...args);
    json.file_ids = this.fileIds();
    if (this.draft) {
      json.object = 'draft';
    }

    return json;
  }

  save(params = {}, callback?: SaveCallback) {
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

  toString() {
    if (this.rawMime) {
      throw Error('toString() cannot be called for raw MIME drafts');
    }
    return super.toString();
  }

  send(callback?: (error: Error | null, message?: Message) => void, tracking?: boolean) {
    let body: any = this.rawMime,
      headers: { [key: string]: string } = { 'Content-Type': 'message/rfc822' },
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
          body.tracking = tracking;
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
      .then((json: any) => {
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
