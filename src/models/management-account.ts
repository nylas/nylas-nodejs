import ManagementModel from './management-model';
import Attributes from './attributes';
import { SaveCallback } from './restful-model';

export default class ManagementAccount extends ManagementModel {
  billingState?: string;
  emailAddress?: string;
  namespaceId?: string;
  provider?: string;
  syncState?: string;
  trial?: boolean;
  metadata?: object;

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

  save(params: {} | SaveCallback = {}, callback?: SaveCallback) {
    return this._save(params, callback);
  }

  saveRequestBody() {
    return {
      metadata: this.metadata,
    };
  }

  saveEndpoint(): string {
    return `/a/${this.connection.clientId}/accounts`;
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
  metadata: Attributes.Object({
    modelKey: 'metadata',
  }),
};
