import RestfulModel from './restful-model';
import Attributes, { Attribute } from './attributes';
import NylasConnection from '../nylas-connection';
import { NativeAuthenticationProvider, Scope } from './connect';

export enum AuthStatusState {
  Valid = 'valid',
  Invalid = 'invalid',
}

export type AuthStatusProperties = {
  state: AuthStatusState;
  provider: NativeAuthenticationProvider;
  scopes: string;
  error_message?: string;
};

export type AccountProperties = {
  name: string;
  emailAddress: string;
  provider: string;
  organizationUnit: string;
  /**
   * @deprecated will be removed in future versions. use `authStatus` instead
   */
  syncState: string;
  authStatus?: AuthStatusProperties;
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
  authStatus = undefined;
  linkedAt = new Date();
  accessToken = '';
  billingState?: string;
  static collectionName = 'accounts';
  static endpointName = 'account';
  static attributes: Record<string, Attribute> = {
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

    authStatus: Attributes.Object({
      modelKey: 'authStatus',
      jsonKey: 'auth_status',
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

  constructor(connection: NylasConnection, props?: AccountProperties) {
    super(connection, props);
    this.initAttributes(props);
  }
}
