import Contact, { ContactProperties, Group } from './contact';
import NylasConnection from '../nylas-connection';
import RestfulModelCollection from './restful-model-collection';
import { RestfulQuery } from './model-collection';

export interface ContactQuery extends RestfulQuery {
  email?: string;
  phoneNumber?: string;
  streetAddress?: string;
  postalCode?: string;
  state?: string;
  country?: string;
  source?: string;
  groupId?: string;
  recurse?: boolean;
}

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

  list(
    params: ContactQuery = {},
    callback?: (error: Error | null, obj?: Contact[]) => void
  ): Promise<Contact[]> {
    return super.list(this.formatQuery(params), callback);
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

  protected formatQuery(query: ContactQuery): Record<string, unknown> {
    return {
      ...super.formatQuery(query),
      email: query.email,
      phone_number: query.phoneNumber,
      postal_code: query.postalCode,
      state: query.state,
      country: query.country,
      source: query.source,
      group_id: query.groupId,
      recurse: query.recurse,
    };
  }
}
