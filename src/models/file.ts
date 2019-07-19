import RestfulModel from './restful-model';
import Attributes from './attributes';

export default class File extends RestfulModel {
  filename?: string;
  data?: any;
  messageIds?: string[]
  contentType?: string;
  contentId?: string
  contentDisposition?:string;
  size?: string;

  upload = (callback?: (error: Error | null, model?: File) => void) => {
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
        path: `/${File.collectionName}`,
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
      .then((json: any) => {
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

  download = (callback?:(error: Error | null, file?: {body: any, [key: string]: any}) => void) => {
    if (!this.id) {
      throw new Error('Please provide a File id');
    }

    return this.connection
      .request({
        path: `/files/${this.id}/download`,
        encoding: null,
        downloadRequest: true,
      })
      .then((response: any) => {
        let filename;
        const file = { ...response.headers, body: response.body };
        if ('content-disposition' in file) {
          filename =
            /filename=([^;]*)/.exec(file['content-disposition'])![1] ||
            'filename';
        } else {
          filename = 'filename';
        }
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

  metadata = (callback?:(error: Error | null, metadata?: { [key: string]: any}) => void) => {
    return this.connection
      .request({
        path: `/files/${this.id}`,
      })
      .then((response: any) => {
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
  messageIds: Attributes.Collection({
    modelKey: 'messageIds',
    jsonKey: 'message_ids',
    itemClass: String as any,
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
