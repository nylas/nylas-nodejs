import ManagementModel from './management-model';
import Attributes, { Attribute } from './attributes';
import NylasConnection from '../nylas-connection';
import Model from './model';
import { SaveCallback } from './restful-model';

export type ApplicationIPAddressesProperties = {
  ipAddresses: string[];
  updatedAt: number;
};

export class ApplicationIPAddresses extends Model
  implements ApplicationIPAddressesProperties {
  ipAddresses: string[] = [];
  updatedAt = 0;
  static attributes: Record<string, Attribute> = {
    ipAddresses: Attributes.StringList({
      modelKey: 'ipAddresses',
      jsonKey: 'ip_addresses',
    }),
    updatedAt: Attributes.Number({
      modelKey: 'updatedAt',
      jsonKey: 'updated_at',
    }),
  };

  constructor(props?: ApplicationIPAddressesProperties) {
    super();
    this.initAttributes(props);
  }
}

export type AccountTokenInfoProperties = {
  scopes: string;
  state: string;
  createdAt: number;
  updatedAt: number;
};

export class AccountTokenInfo extends Model
  implements AccountTokenInfoProperties {
  scopes = '';
  state = '';
  createdAt = 0;
  updatedAt = 0;
  static attributes: Record<string, Attribute> = {
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
  };

  constructor(props?: AccountTokenInfoProperties) {
    super();
    this.initAttributes(props);
  }
}

export type ManagementAccountProperties = {
  billingState: string;
  emailAddress: string;
  namespaceId: string;
  provider: string;
  syncState: string;
  authenticationType: string;
  trial: boolean;
  metadata?: object;
};

export type AccountOperationResponse = {
  success: boolean;
};

export default class ManagementAccount extends ManagementModel
  implements ManagementAccountProperties {
  billingState = '';
  emailAddress = '';
  namespaceId = '';
  provider = '';
  syncState = '';
  authenticationType = '';
  trial = false;
  metadata?: object;
  static collectionName = 'accounts';
  static attributes: Record<string, Attribute> = {
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
    authenticationType: Attributes.String({
      modelKey: 'authenticationType',
      jsonKey: 'authentication_type',
    }),
    trial: Attributes.Boolean({
      modelKey: 'trial',
    }),
    metadata: Attributes.Object({
      modelKey: 'metadata',
    }),
  };

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
      .then(json =>
        Promise.resolve(new ApplicationIPAddresses().fromJSON(json))
      )
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

  save(params: {} | SaveCallback = {}, callback?: SaveCallback): Promise<this> {
    return super.save(params, callback);
  }

  saveRequestBody(): Record<string, unknown> {
    return {
      metadata: this.metadata,
    };
  }

  saveEndpoint(): string {
    return `/a/${this.connection.clientId}/accounts`;
  }
}
