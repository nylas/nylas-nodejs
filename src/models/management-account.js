import _ from 'underscore';

import ManagementModel from './management-model';
import Attributes from './attributes';

export default class ManagementAccount extends ManagementModel {
  upgrade() {
    return this.connection
      .request({
        method: 'POST',
        path: `/a/${this.appId}/${this.constructor.collectionName}/${this
          .id}/upgrade`,
      })
      .catch(err => Promise.reject(err));
  }

  downgrade() {
    return this.connection
      .request({
        method: 'POST',
        path: `/a/${this.appId}/${this.constructor.collectionName}/${this
          .id}/downgrade`,
      })
      .catch(err => Promise.reject(err));
  }
}
ManagementAccount.collectionName = 'accounts';
ManagementAccount.attributes = _.extend({}, ManagementModel.attributes, {
  billingState: Attributes.String({
    modelKey: 'billingState',
    jsonKey: 'billing_state',
  }),
  namespaceId: Attributes.String({
    modelKey: 'namespaceId',
    jsonKey: 'namespace_id',
  }),
  syncState: Attributes.String({
    modelKey: 'syncState',
    jsonKey: 'sync_state',
  }),
  trial: Attributes.Boolean({
    modelKey: 'trial',
  }),
});
