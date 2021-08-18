import Attributes from './attributes';
import Model from './model';

export default class EventParticipant extends Model {
  name?: string;
  email?: string;
  status?: string;

  toJSON(enforceReadOnly?: boolean) {
    const json = super.toJSON(enforceReadOnly);
    if (!json['name']) {
      json['name'] = json['email'];
    }
    return json;
  }
}

EventParticipant.attributes = {
  name: Attributes.String({
    modelKey: 'name',
  }),
  email: Attributes.String({
    modelKey: 'email',
  }),
  status: Attributes.String({
    modelKey: 'status',
  }),
};
