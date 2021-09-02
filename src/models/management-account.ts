import ManagementModel from './management-model';
import Attributes from './attributes';
import NylasConnection from '../nylas-connection';

export interface ManagementAccountProperties {
  billingState: string;
  emailAddress: string;
  namespaceId: string;
  provider: string;
  syncState: string;
  trial: boolean;
}

export default class ManagementAccount extends ManagementModel
  implements ManagementAccountProperties {
  billingState: string;
  emailAddress: string;
  namespaceId: string;
  provider: string;
  syncState: string;
  trial: boolean;

  constructor(
    connection: NylasConnection,
    clientId: string,
    props: ManagementAccountProperties
  ) {
    super(connection, clientId, props);
    this.billingState = props.billingState;
    this.emailAddress = props.emailAddress;
    this.namespaceId = props.namespaceId;
    this.provider = props.provider;
    this.syncState = props.syncState;
    this.trial = props.trial;
  }

  upgrade() {
    return this.connection
      .request({
        method: 'POST',
        path: `/a/${this.clientId}/${
          (this.constructor as any).collectionName
        }/${this.id}/upgrade`,
      })
      .catch(err => Promise.reject(err));
  }

  downgrade() {
    return this.connection
      .request({
        method: 'POST',
        path: `/a/${this.clientId}/${
          (this.constructor as any).collectionName
        }/${this.id}/downgrade`,
      })
      .catch(err => Promise.reject(err));
  }

  revokeAll(keepAccessToken?: string) {
    return this.connection
      .request({
        method: 'POST',
        path: `/a/${this.clientId}/${
          (this.constructor as any).collectionName
        }/${this.id}/revoke-all`,
        body: { keep_access_token: keepAccessToken },
      })
      .catch(err => Promise.reject(err));
  }
  ipAddresses() {
    return this.connection
      .request({
        method: 'GET',
        path: `/a/${this.clientId}/ip_addresses`,
      })
      .catch(err => Promise.reject(err));
  }
  tokenInfo(accessToken?: string) {
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
