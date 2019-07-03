import isFunction from 'lodash/isFunction';

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
    const attributes = this.attributes();
    for (const attrName in attributes) {
      const attr = attributes[attrName];
      if (json[attr.jsonKey] !== undefined) {
        this[attrName] = attr.fromJSON(json[attr.jsonKey], this);
      }
    }
    return this;
  }

  toJSON() {
    const json = {};
    const attributes = this.attributes();
    for (const attrName in attributes) {
      const attr = attributes[attrName];
      json[attr.jsonKey] = attr.toJSON(this[attrName]);
    }
    json['object'] = this.constructor.name.toLowerCase();
    return json;
  }

  // Subclasses should override this method.
  pathPrefix() {
    return '';
  }

  saveEndpoint() {
    return `${this.pathPrefix()}/${this.constructor.collectionName}`;
  }

  // saveRequestBody is used by save(). It returns a JSON dict containing only the
  // fields the API allows updating. Subclasses should override this method.
  saveRequestBody() {
    return this.toJSON();
  }

  // deleteRequestQueryString is used by delete(). Subclasses should override this method.
  deleteRequestQueryString(params) {
    return {};
  }
  // deleteRequestBody is used by delete(). Subclasses should override this method.
  deleteRequestBody(params) {
    return {};
  }

  // deleteRequestOptions is used by delete(). Subclasses should override this method.
  deleteRequestOptions(params) {
    return {
      body: this.deleteRequestBody(params),
      qs: this.deleteRequestQueryString(params),
    };
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }

  // Not every model needs to have a save function, but those who
  // do shouldn't have to reimplement the same boilerplate.
  // They should instead define a save() function which calls _save.
  _save(params = {}, callback = null) {
    if (isFunction(params)) {
      callback = params;
      params = {};
    }
    return this.connection
      .request({
        method: this.id ? 'PUT' : 'POST',
        body: this.saveRequestBody(),
        qs: params,
        path: this.id
          ? `${this.saveEndpoint()}/${this.id}`
          : `${this.saveEndpoint()}`,
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

  _get(params = {}, callback = null, path_suffix = '') {
    return this.connection
      .request({
        method: 'GET',
        path: `/${this.constructor.collectionName}/${this.id}${path_suffix}`,
        qs: params,
      })
      .then(response => {
        return Promise.resolve(response);
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
