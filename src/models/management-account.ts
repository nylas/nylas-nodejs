import ManagementModel from './management-model';
import Attributes from './attributes';

export default class ManagementAccount extends ManagementModel {
  billingState?: string;
  emailAddress?: string;
  namespaceId?: string;
  provider?: string;
  syncState?: string;
  trial?: boolean;

  upgrade() {
    return this.connection
      .request({
        method: 'POST',
        path: `/a/${this.clientId}/${(this.constructor as any).collectionName}/${this.id}/upgrade`,
      })
      .catch(err => Promise.reject(err));
  }

  downgrade() {
    return this.connection
      .request({
        method: 'POST',
        path: `/a/${this.clientId}/${(this.constructor as any).collectionName}/${this.id}/downgrade`,
      })
      .catch(err => Promise.reject(err));
  }

  revokeAll(keep_access_token?: string) {
    return this.connection
      .request({
        method: 'POST',
        path: `/a/${this.clientId}/${(this.constructor as any).collectionName}/${this.id}/revoke-all`,
        body: { keep_access_token: keep_access_token },
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
  tokenInfo(access_token?: string) {
    return this.connection
      .request({
        method: 'POST',
        path: `/a/${this.clientId}/${(this.constructor as any).collectionName}/${this.id}/token-info`,
        body: {
          access_token: access_token,
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
