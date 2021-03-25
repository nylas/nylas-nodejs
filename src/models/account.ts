import RestfulModel from './restful-model';
import Attributes from './attributes';

export default class Account extends RestfulModel {
  name?: string;
  emailAddress?: string;
  provider?: string;
  organizationUnit?: string;
  syncState?: string;
  billingState?: string;
  linkedAt?: Date;
}
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

  billingState: Attributes.String({
    modelKey: 'billingState',
    jsonKey: 'billing_state',
  }),

  linkedAt: Attributes.DateTime({
    modelKey: 'linkedAt',
    jsonKey: 'linked_at',
  }),
};
