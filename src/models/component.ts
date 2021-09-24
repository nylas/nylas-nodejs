import RestfulModel, { SaveCallback } from './restful-model';
import Attributes from './attributes';

export default class Component extends RestfulModel {
  name?: string;
  type?: string;
  action?: number;
  active?: boolean;
  settings?: object;
  allowedDomains?: string[];
  publicAccountId?: string;
  publicTokenId?: string;
  publicApplicationId?: string;
  createdAt?: Date;
  updatedAt?: Date;

  saveEndpoint(): string {
    return `/component/${this.connection.clientId}`;
  }

  save(params: {} | SaveCallback = {}, callback?: SaveCallback) {
    return this._save(params, callback);
  }
}
Component.collectionName = 'component';
Component.attributes = {
  ...RestfulModel.attributes,
  name: Attributes.String({
    modelKey: 'name',
  }),
  type: Attributes.String({
    modelKey: 'type',
  }),
  action: Attributes.Number({
    modelKey: 'action',
  }),
  active: Attributes.Boolean({
    modelKey: 'active',
  }),
  settings: Attributes.Object({
    modelKey: 'settings',
  }),
  allowedDomains: Attributes.StringList({
    modelKey: 'allowedDomains',
    jsonKey: 'allowed_domains',
  }),
  publicAccountId: Attributes.String({
    modelKey: 'publicAccountId',
    jsonKey: 'public_account_id',
  }),
  publicTokenId: Attributes.String({
    modelKey: 'publicTokenId',
    jsonKey: 'public_token_id',
  }),
  publicApplicationId: Attributes.String({
    modelKey: 'publicApplicationId',
    jsonKey: 'public_application_id',
  }),
  createdAt: Attributes.Date({
    modelKey: 'createdAt',
    jsonKey: 'created_at',
  }),
  updatedAt: Attributes.Date({
    modelKey: 'updatedAt',
    jsonKey: 'updated_at',
  }),
};
