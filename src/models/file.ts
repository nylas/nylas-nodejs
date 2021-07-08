import Attributes from './attributes';
import RestfulModel from './restful-model';

export default class File extends RestfulModel {
  contentType?: string;
  size?: number;
  filename?: string;
  messageIds?: string[];
  contentId?: string;
  contentDisposition?: string;
  data?: any;

  upload(callback?: (error: Error | null, model?: File) => void) {
    if (!this.filename) {
      throw new Error('Please define a filename');
    }
    if (!this.data) {
      throw new Error('Please add some data to the file');
    }
    if (!this.contentType) {
      throw new Error('Please define a content-type');
    }

    const formOptions: { [key: string]: any } = {
      filename: this.filename,
      contentType: this.contentType,
    };

    if (this.size) {
      formOptions.knownLength = this.size;
    }

    return this.connection
      .request({
        method: 'POST',
        path: `/${File.collectionName}`,
        json: true,
        formData: {
          file: {
            value: this.data,
            options: formOptions,
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
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }

  download(
    callback?: (
      error: Error | null,
      file?: { body: any; [key: string]: any }
    ) => void
  ) {
    if (!this.id) {
      throw new Error('Please provide a File id');
    }

    return this.connection
      .request({
        path: `/files/${this.id}/download`,
        downloadRequest: true,
      })
      .then(file => {
        if (callback) {
          callback(null, file);
        }
        return Promise.resolve(file);
      })
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }

  metadata(
    callback?: (error: Error | null, data?: { [key: string]: any }) => void
  ) {
    return this.connection
      .request({
        path: `/files/${this.id}`,
      })
      .then(response => {
        if (callback) {
          callback(null, response);
        }
        return Promise.resolve(response);
      })
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }
}
File.collectionName = 'files';
File.attributes = {
  ...RestfulModel.attributes,
  contentType: Attributes.String({
    modelKey: 'contentType',
    jsonKey: 'content_type',
  }),
  size: Attributes.Number({
    modelKey: 'size',
    jsonKey: 'size',
  }),
  filename: Attributes.String({
    modelKey: 'filename',
    jsonKey: 'filename',
  }),
  messageIds: Attributes.StringList({
    modelKey: 'messageIds',
    jsonKey: 'message_ids',
  }),
  contentId: Attributes.String({
    modelKey: 'contentId',
    jsonKey: 'content_id',
  }),
  contentDisposition: Attributes.String({
    modelKey: 'contentDisposition',
    jsonKey: 'content_disposition',
  }),
};
