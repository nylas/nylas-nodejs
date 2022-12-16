import RestfulModelCollection from './restful-model-collection';
import File, { FileProperties } from './file';
import NylasConnection from '../nylas-connection';
import { RestfulQuery } from './model-collection';

export interface FileQuery extends RestfulQuery {
  filename?: string;
  messageId?: string;
  contentType?: string;
}

export default class FileRestfulModelCollection extends RestfulModelCollection<
  File
> {
  constructor(connection: NylasConnection) {
    super(File, connection);
  }

  create(
    props: FileProperties,
    callback?: (error: Error | null, result?: File) => void
  ): Promise<File> {
    return new File(this.connection, props).upload(callback);
  }

  list(
    params: FileQuery,
    callback?: (error: Error | null, obj?: any[]) => void
  ): Promise<any[]> {
    return super.list(params, callback);
  }

  protected formatQuery(query: FileQuery): Record<string, unknown> {
    return {
      ...super.formatQuery(query),
      filename: query.filename,
      message_id: query.messageId,
      content_type: query.contentType,
    };
  }
}
