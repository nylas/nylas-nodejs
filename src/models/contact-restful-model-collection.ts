import Contact, { Group } from './contact';
import NylasConnection from '../nylas-connection';
import RestfulModelCollection from './restful-model-collection';

export default class ContactRestfulModelCollection extends RestfulModelCollection<
  Contact
> {
  connection: NylasConnection;
  modelClass: typeof Contact;

  constructor(connection: NylasConnection) {
    super(Contact, connection);
    this.connection = connection;
    this.modelClass = Contact;
  }

  groups(
    callback?: (error: Error | null, data?: Record<string, any>) => void
  ): Promise<Group[]> {
    return this.connection
      .request({
        method: 'GET',
        path: `/contacts/groups`,
      })
      .then(json => {
        const groups: Group[] = json.map((group: Record<string, any>) => {
          return new Group().fromJSON(group);
        });
        if (callback) {
          callback(null, groups);
        }
        return Promise.resolve(groups);
      })
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }
}
