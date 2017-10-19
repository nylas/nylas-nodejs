import _ from 'underscore';

import RestfulModel from './restful-model';
import Attributes from './attributes';

export default class ManagementAccount extends RestfulModel {}
ManagementAccount.collectionName = 'accounts';
ManagementAccount.attributes = _.extend({}, RestfulModel.attributes, {
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
