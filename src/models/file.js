const RestfulModel = require('./restful-model');
const Attributes = require('./attributes');
const _ = require('underscore');

export class File extends RestfulModel {
  constructor(...args) {
    super(...args);
    this.upload = this.upload.bind(this);
    this.download = this.download.bind(this);
    this.collectionName = 'files';

    this.attributes = _.extend({}, RestfulModel.attributes, {
      filename: Attributes.String({
        modelKey: 'filename',
        jsonKey: 'filename',
      }),
      size: Attributes.Number({
        modelKey: 'size',
        jsonKey: 'size',
      }),
      contentType: Attributes.String({
        modelKey: 'contentType',
        jsonKey: 'content_type',
      }),
      messageIds: Attributes.Collection({
        modelKey: 'messageIds',
        jsonKey: 'message_ids',
        itemClass: String,
      }),
      contentId: Attributes.String({
        modelKey: 'contentId',
        jsonKey: 'content_id',
      }),
    });
  }

  upload(callback = null) {
    if (!this.filename) {
      throw new Error('Please define a filename');
    }
    if (!this.data) {
      throw new Error('Please add some data to the file');
    }
    if (!this.contentType) {
      throw new Error('Please define a content-type');
    }

    return this.connection
      .request({
        method: 'POST',
        json: false,
        path: `/${this.constructor.collectionName}`,
        formData: {
          file: {
            value: this.data,
            options: {
              filename: this.filename,
              contentType: this.contentType,
            },
          },
        },
      })
      .then(json => {
        // The API returns a list of files. It should
        // always have a length of 1 since we only
        // upload file-by-file.
        if (json.length > 0) {
          this.fromJSON(json[0]);
          if (callback) {
            callback(null, this);
          }
          return Promise.resolve(this);
        } else {
          return Promise.reject(null);
        }
      })
      .catch(function(err) {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }

  download(callback = null) {
    if (!this.id) {
      throw new Error('Please provide a File id');
    }

    return this.connection
      .request({
        path: `/files/${this.id}/download`,
        encoding: null,
        downloadRequest: true,
      })
      .then(response => {
        let filename;
        const file = _.extend(response.headers, { body: response.body });
        if ('content-disposition' in file) {
          filename =
            /filename=([^;]*)/.exec(file['content-disposition'])[1] ||
            'filename';
        } else {
          filename = 'filename';
        }
        if (callback) {
          callback(null, file);
        }
        return Promise.resolve(file);
      })
      .catch(function(err) {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }

  metadata(callback = null) {
    if (!this.id) {
      throw new Error('Please provide a File id');
    }

    return this.connection
      .request({
        path: `/files/${this.id}`,
      })
      .then(function(response) {
        if (callback) {
          callback(null, response);
        }
        return Promise.resolve(response);
      })
      .catch(function(err) {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }
}
