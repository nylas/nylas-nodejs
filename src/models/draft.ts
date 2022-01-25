import Message, { MessageProperties } from './message';
import Attributes, { Attribute } from './attributes';
import { SaveCallback } from './restful-model';
import NylasConnection from '../nylas-connection';

export type SendCallback = (
  err: Error | null,
  json?: Record<string, any>
) => void;

export type DraftProperties = MessageProperties & {
  rawMime?: string;
  replyToMessageId?: string;
  version?: number;
};

export default class Draft extends Message implements DraftProperties {
  rawMime?: string;
  replyToMessageId?: string;
  version?: number;
  static collectionName = 'drafts';
  static attributes: Record<string, Attribute> = {
    ...Message.attributes,
    version: Attributes.Number({
      modelKey: 'version',
    }),
    replyToMessageId: Attributes.String({
      modelKey: 'replyToMessageId',
      jsonKey: 'reply_to_message_id',
    }),
    rawMime: Attributes.String({
      modelKey: 'rawMime',
      readOnly: true,
    }),
  };

  constructor(connection: NylasConnection, props?: DraftProperties) {
    super(connection, props);
    this.initAttributes(props);
  }

  toJSON(enforceReadOnly?: boolean): Record<string, any> {
    if (this.rawMime) {
      throw Error('toJSON() cannot be called for raw MIME drafts');
    }
    const json = super.toJSON(enforceReadOnly);
    json.file_ids = super.fileIds();

    return json;
  }

  save(params: {} | SaveCallback = {}, callback?: SaveCallback): Promise<this> {
    if (this.rawMime) {
      const err = new Error('save() cannot be called for raw MIME drafts');
      if (callback) {
        callback(err);
      }
      return Promise.reject(err);
    }
    return super.save(params, callback);
  }

  saveRequestBody(): Record<string, unknown> {
    if (this.rawMime) {
      throw Error('saveRequestBody() cannot be called for raw MIME drafts');
    }
    return super.saveRequestBody();
  }

  deleteRequestBody(
    params: Record<string, unknown> = {}
  ): Record<string, unknown> {
    const body: Record<string, unknown> = {};
    body.version = params.hasOwnProperty('version')
      ? params.version
      : this.version;
    return body;
  }

  toString(): string {
    if (this.rawMime) {
      throw Error('toString() cannot be called for raw MIME drafts');
    }
    return super.toString();
  }

  send(
    trackingArg?: Record<string, any> | SendCallback | null,
    callbackArg?: SendCallback | Record<string, any> | null
  ): Promise<Message> {
    // callback used to be the first argument, and tracking was the second
    let callback: SendCallback | undefined;
    if (typeof callbackArg === 'function') {
      callback = callbackArg as SendCallback;
    } else if (typeof trackingArg === 'function') {
      callback = trackingArg as SendCallback;
    }
    let tracking: Record<string, any> | undefined;
    if (trackingArg && typeof trackingArg === 'object') {
      tracking = trackingArg;
    } else if (callbackArg && typeof callbackArg === 'object') {
      tracking = callbackArg;
    }

    let body: any = this.rawMime,
      headers: Record<string, string> = { 'Content-Type': 'message/rfc822' },
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
        const message = new Message(this.connection).fromJSON(json);

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
