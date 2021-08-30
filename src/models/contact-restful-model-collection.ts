import { Contact, Group } from './contact';
import NylasConnection from '../nylas-connection';
import RestfulModelCollection from './restful-model-collection';
import { GroupProperties } from './contact';

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
    callback?: (error: Error | null, data?: { [key: string]: any }) => void
  ) {
    return this.connection
      .request({
        method: 'GET',
        path: `/contacts/groups`,
      })
      .then(json => {
        const groups = json.map((group: { [key: string]: any }) => {
          const props = Group.propsFromJSON(group, this) as GroupProperties;
          return new Group(props);
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
