import RestfulModel from './restful-model';
import Attributes from './attributes';
import NylasConnection from '../nylas-connection';

export interface AccountProperties {
  name: string;
  emailAddress: string;
  provider: string;
  organizationUnit: string;
  syncState: string;
  linkedAt: Date;
  billingState?: string;
}

export default class Account extends RestfulModel implements AccountProperties {
  name!: string;
  emailAddress!: string;
  provider!: string;
  organizationUnit!: string;
  syncState!: string;
  linkedAt!: Date;
  billingState?: string;

  constructor(connection: NylasConnection, props?: AccountProperties) {
    super(connection, props);
    if(!props) {
      this.name = '';
      this.emailAddress = '';
      this.provider = '';
      this.organizationUnit = '';
      this.syncState = '';
      this.linkedAt = new Date();
    }
  }
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
