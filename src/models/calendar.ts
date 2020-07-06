import RestfulModel, { SaveCallback } from './restful-model';
import Attributes from './attributes';

export default class Calendar extends RestfulModel {
  name?: string;
  description?: string;
  readOnly?: boolean;
  location?: string;
  timezone?: string;
  isPrimary?: boolean;

  save(params: {} | SaveCallback = {}, callback?: SaveCallback) {
    return this._save(params, callback);
  }

  saveRequestBody() {
    const calendarJSON = this.toJSON();
    return {
      name: calendarJSON.name,
      description: calendarJSON.description,
      location: calendarJSON.location,
      timezone: calendarJSON.timezone
    };
  }
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
  location: Attributes.String({
    modelKey: 'location',
  }),
  timezone: Attributes.String({
    modelKey: 'timezone',
  }),
  isPrimary: Attributes.Boolean({
    modelKey: 'isPrimary',
    jsonKey: 'is_primary',
  }),
};
