import Promise from 'bluebird';
import _ from 'underscore';

import * as Attributes from './attributes';

export default class RestfulModel {
  constructor(connection, json = null) {
    this.connection = connection;
    if (!(this.connection instanceof require('../nylas-connection'))) {
      throw new Error('Connection object not provided');
    }
    if (json) {
      this.fromJSON(json);
    }
  }

  attributes() {
    return this.constructor.attributes;
  }

  isEqual(other) {
    return (
      (other ? other.id : undefined) === this.id &&
      (other ? other.constructor : undefined) === this.constructor
    );
  }

  fromJSON(json = {}) {
    const object = this.attributes();
    for (const key in object) {
      const attr = object[key];
      if (json[attr.jsonKey] !== undefined) {
        this[key] = attr.fromJSON(json[attr.jsonKey], this);
      }
    }
    return this;
  }

  toJSON() {
    const json = {};
    const object = this.attributes();
    for (const key in object) {
      const attr = object[key];
      json[attr.jsonKey] = attr.toJSON(this[key]);
    }
    json['object'] = this.constructor.name.toLowerCase();
    return json;
  }

  // saveRequestBody is used by save(). It returns a JSON dict containing only the
  // fields the API allows updating. Subclasses should override this method.
  saveRequestBody() {
    return this.toJSON();
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }

  // Not every model needs to have a save function, but those who
  // do shouldn't have to reimplement the same boilerplate.
  // They should instead define a save() function which calls _save.
  _save(params, callback = null) {
    if (!params) {
      params = {};
    }
    if (_.isFunction(params)) {
      callback = params;
      params = {};
    }
    return this.connection
      .request({
        method: this.id ? 'PUT' : 'POST',
        body: this.saveRequestBody(),
        qs: params,
        path: this.id
          ? `/${this.constructor.collectionName}/${this.id}`
          : `/${this.constructor.collectionName}`,
      })
      .then(json => {
        this.fromJSON(json);
        if (callback) {
          callback(null, this);
        }
        return Promise.resolve(this);
      })
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }
}
RestfulModel.attributes = {
  id: Attributes.String({
    modelKey: 'id',
  }),
  object: Attributes.String({
    modelKey: 'object',
  }),
  accountId: Attributes.String({
    modelKey: 'accountId',
    jsonKey: 'account_id',
  }),
};
