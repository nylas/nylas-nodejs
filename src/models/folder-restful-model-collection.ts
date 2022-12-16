import RestfulModelCollection from './restful-model-collection';
import Folder, { FolderProperties } from './folder';
import NylasConnection from '../nylas-connection';
import { RestfulQuery } from './model-collection';

export default class FolderRestfulModelCollection extends RestfulModelCollection<
  Folder
> {
  constructor(connection: NylasConnection) {
    super(Folder, connection);
  }

  create(
    props: FolderProperties,
    callback?: (error: Error | null, result?: Folder) => void
  ): Promise<Folder> {
    return new Folder(this.connection, props).save(callback);
  }

  list(
    params: RestfulQuery,
    callback?: (error: Error | null, obj?: Folder[]) => void
  ): Promise<Folder[]> {
    return super.list(params, callback);
  }
}
