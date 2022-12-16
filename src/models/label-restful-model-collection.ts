import RestfulModelCollection from './restful-model-collection';
import { FolderProperties, Label } from './folder';
import NylasConnection from '../nylas-connection';
import { RestfulQuery } from './model-collection';

export default class LabelRestfulModelCollection extends RestfulModelCollection<
  Label
> {
  constructor(connection: NylasConnection) {
    super(Label, connection);
  }

  list(
    params: RestfulQuery,
    callback?: (error: Error | null, obj?: Label[]) => void
  ): Promise<Label[]> {
    return super.list(params, callback);
  }
}
