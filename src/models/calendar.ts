import RestfulModel from './restful-model';
import Attributes from './attributes';

export default class Calendar extends RestfulModel {
  name?: string;
  description?: string;
  readOnly?: boolean;
}
Calendar.collectionName = 'calendars';
Calendar.attributes = {
  ...RestfulModel.attributes,
  name: Attributes.String({
    modelKey: 'name',
  }),
  description: Attributes.String({
    modelKey: 'description',
  }),
  readOnly: Attributes.Boolean({
    modelKey: 'readOnly',
    jsonKey: 'read_only',
  }),
};
