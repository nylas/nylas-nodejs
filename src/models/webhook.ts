import ManagementModel from './management-model';
import Attributes from './attributes';
import { SaveCallback } from './restful-model';

export default class Webhook extends ManagementModel {
  id?: string;
  applicationId?: string;
  callbackUrl?: string;
  state?: string;
  triggers?: string[];
  version?: string;

  pathPrefix() {
    return `/a/${this.clientId}`;
  }
  saveRequestBody() {
    const json: { [key: string]: any } = {};
    // We can only update the state of an existing webhook
    if (this.id) {
      json['state'] = this.state;
    } else {
      json['callback_url'] = this.callbackUrl;
      json['state'] = this.state ? this.state : 'active';
      json['triggers'] = Webhook.attributes.triggers.toJSON(this.triggers);
    }
    return json;
  }
  save(params: {} | SaveCallback = {}, callback?: SaveCallback) {
    return this._save(params, callback);
  }
}

Webhook.collectionName = 'webhooks';
Webhook.attributes = {
  id: Attributes.String({
    modelKey: 'id',
  }),

  applicationId: Attributes.String({
    modelKey: 'applicationId',
    jsonKey: 'application_id',
  }),

  callbackUrl: Attributes.String({
    modelKey: 'callbackUrl',
    jsonKey: 'callback_url',
  }),

  state: Attributes.String({
    modelKey: 'state',
  }),

  triggers: Attributes.StringList({
    modelKey: 'triggers',
  }),

  version: Attributes.String({
    modelKey: 'version',
  }),
};
