import RestfulModel from './restful-model';
import Attributes from './attributes';

export class Account extends RestfulModel {
  constructor() {
    super();
    this.collectionName = 'accounts';
    this.endpointName = 'account';

    this.attributes = _.extend({}, RestfulModel.attributes, {
      name: Attributes.String({
        modelKey: 'name',
      }),

      emailAddress: Attributes.String({
        modelKey: 'emailAddress',
        jsonKey: 'email_address',
      }),

      provider: Attributes.String({
        modelKey: 'provider',
      }),

      organizationUnit: Attributes.String({
        modelKey: 'organizationUnit',
        jsonKey: 'organization_unit',
      }),

      syncState: Attributes.String({
        modelKey: 'syncState',
        jsonKey: 'sync_state',
      }),
    });
  }
}
