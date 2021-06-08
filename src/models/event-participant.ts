import RestfulModel from './restful-model';
import Attributes from './attributes';

export default class EventParticipant extends RestfulModel {
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
EventParticipant.collectionName = 'event-participants';
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
