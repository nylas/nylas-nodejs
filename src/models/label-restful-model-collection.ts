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

  create(
    props: FolderProperties,
    callback?: (error: Error | null, result?: Label) => void
  ): Promise<Label> {
    return new Label(this.connection, props).save(callback);
  }

  list(
    params: RestfulQuery,
    callback?: (error: Error | null, obj?: Label[]) => void
  ): Promise<Label[]> {
    return super.list(params, callback);
  }
}
