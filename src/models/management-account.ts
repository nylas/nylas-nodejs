import ManagementModel from './management-model';
import Attributes from './attributes';
import NylasConnection from '../nylas-connection';
import Model from './model';

export interface ApplicationIPAddressesProperties {
  ipAddresses: string[];
  updatedAt: number;
}

export class ApplicationIPAddresses extends Model implements ApplicationIPAddressesProperties {
  ipAddresses = [];
  updatedAt = 0;

  constructor(props?: ApplicationIPAddressesProperties) {
    super();
    this.initAttributes(props);
  }
}
ApplicationIPAddresses.attributes = {
  ipAddresses: Attributes.StringList({
    modelKey: 'ipAddresses',
    jsonKey: 'ip_addresses',
  }),
  updatedAt: Attributes.Number({
    modelKey: 'updatedAt',
    jsonKey: 'updated_at',
  }),
}

export interface AccountTokenInfoProperties {
  scopes: string;
  state: string;
  createdAt: number;
  updatedAt: number;
}

export class AccountTokenInfo extends Model implements AccountTokenInfoProperties {
  scopes = '';
  state = '';
  createdAt = 0;
  updatedAt = 0;

  constructor(props?: AccountTokenInfoProperties) {
    super();
    this.initAttributes(props);
  }
}
AccountTokenInfo.attributes = {
  scopes: Attributes.String({
    modelKey: 'scopes',
  }),
  state: Attributes.String({
    modelKey: 'state',
  }),
  createdAt: Attributes.Number({
    modelKey: 'createdAt',
    jsonKey: 'created_at',
  }),
  updatedAt: Attributes.Number({
    modelKey: 'updatedAt',
    jsonKey: 'updated_at',
  }),
}

export interface ManagementAccountProperties {
  billingState: string;
  emailAddress: string;
  namespaceId: string;
  provider: string;
  syncState: string;
  trial: boolean;
}

export type AccountOperationResponse = {
  success: boolean;
}

export default class ManagementAccount extends ManagementModel
  implements ManagementAccountProperties {
  billingState = '';
  emailAddress = '';
  namespaceId = '';
  provider = '';
  syncState = '';
  trial = false;

  constructor(
    connection: NylasConnection,
    clientId: string,
    props: ManagementAccountProperties
  ) {
    super(connection, clientId, props);
    this.initAttributes(props);
  }

  upgrade(): Promise<AccountOperationResponse> {
    return this.connection
      .request({
        method: 'POST',
        path: `/a/${this.clientId}/${
          (this.constructor as any).collectionName
        }/${this.id}/upgrade`,
      })
      .then((json: AccountOperationResponse) => Promise.resolve(json))
      .catch(err => Promise.reject(err));
  }

  downgrade(): Promise<AccountOperationResponse> {
    return this.connection
      .request({
        method: 'POST',
        path: `/a/${this.clientId}/${
          (this.constructor as any).collectionName
        }/${this.id}/downgrade`,
      })
      .then((json: AccountOperationResponse) => Promise.resolve(json))
      .catch(err => Promise.reject(err));
  }

  revokeAll(keepAccessToken?: string): Promise<AccountOperationResponse> {
    return this.connection
      .request({
        method: 'POST',
        path: `/a/${this.clientId}/${
          (this.constructor as any).collectionName
        }/${this.id}/revoke-all`,
        body: { keep_access_token: keepAccessToken },
      })
      .then((json: AccountOperationResponse) => Promise.resolve(json))
      .catch(err => Promise.reject(err));
  }

  ipAddresses(): Promise<ApplicationIPAddresses> {
    return this.connection
      .request({
        method: 'GET',
        path: `/a/${this.clientId}/ip_addresses`,
      })
      .then(json => Promise.resolve(new ApplicationIPAddresses().fromJSON(json)))
      .catch(err => Promise.reject(err));
  }

  tokenInfo(accessToken?: string): Promise<AccountTokenInfo> {
    return this.connection
      .request({
        method: 'POST',
        path: `/a/${this.clientId}/${
          (this.constructor as any).collectionName
        }/${this.id}/token-info`,
        body: {
          access_token: accessToken,
        },
      })
      .then(json => Promise.resolve(new AccountTokenInfo().fromJSON(json)))
      .catch(err => Promise.reject(err));
  }
}
ManagementAccount.collectionName = 'accounts';
ManagementAccount.attributes = {
  ...ManagementModel.attributes,
  billingState: Attributes.String({
    modelKey: 'billingState',
    jsonKey: 'billing_state',
  }),
  emailAddress: Attributes.String({
    modelKey: 'emailAddress',
    jsonKey: 'email',
  }),
  namespaceId: Attributes.String({
    modelKey: 'namespaceId',
    jsonKey: 'namespace_id',
  }),
  provider: Attributes.String({
    modelKey: 'provider',
  }),
  syncState: Attributes.String({
    modelKey: 'syncState',
    jsonKey: 'sync_state',
  }),
  trial: Attributes.Boolean({
    modelKey: 'trial',
  }),
};
