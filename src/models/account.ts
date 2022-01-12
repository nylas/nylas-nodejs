import RestfulModel from './restful-model';
import Attributes from './attributes';
import NylasConnection from '../nylas-connection';

export type AccountProperties = {
  name: string;
  emailAddress: string;
  provider: string;
  organizationUnit: string;
  syncState: string;
  linkedAt: Date;
  billingState?: string;
  accessToken?: string;
};

export default class Account extends RestfulModel implements AccountProperties {
  name = '';
  emailAddress = '';
  provider = '';
  organizationUnit = '';
  syncState = '';
  linkedAt = new Date();
  accessToken = '';
  billingState?: string;

  constructor(connection: NylasConnection, props?: AccountProperties) {
    super(connection, props);
    this.initAttributes(props);
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

  accessToken: Attributes.String({
    modelKey: 'accessToken',
    jsonKey: 'access_token',
  }),
};
