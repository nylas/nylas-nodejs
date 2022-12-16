import RestfulModelCollection from './restful-model-collection';
import Resource from './resource';
import NylasConnection from '../nylas-connection';
import { RestfulQuery } from './model-collection';

export default class ResourceRestfulModelCollection extends RestfulModelCollection<
  Resource
> {
  constructor(connection: NylasConnection) {
    super(Resource, connection);
  }

  list(
    params: RestfulQuery,
    callback?: (error: Error | null, obj?: Resource[]) => void
  ): Promise<Resource[]> {
    return super.list(params, callback);
  }
}
