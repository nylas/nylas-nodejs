import _ from 'underscore';

import RestfulModel from './restful-model';
import * as Attributes from './attributes';

export default class Tag extends RestfulModel {}
Tag.collectionName = 'tags';
Tag.attributes = _.extend({}, RestfulModel.attributes, {
  name: Attributes.String({
    modelKey: 'name',
  }),
});
