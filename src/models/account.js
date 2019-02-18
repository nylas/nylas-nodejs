import _ from 'underscore';

import RestfulModel from './restful-model';
import Attributes from './attributes';

export default class Account extends RestfulModel {}
Account.collectionName = 'accounts';
Account.endpointName = 'account';
Account.attributes = {
  ...RestfulModel.attributes,
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
  linkedAt: Attributes.DateTime({
    modelKey: 'linkedAt',
    jsonKey: 'linked_at',
  }),
};
