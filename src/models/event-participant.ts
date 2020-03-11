import RestfulModel from './restful-model';
import Attributes from './attributes';

export default class EventParticipant extends RestfulModel {
  name?: string;
  email?: string;
  status?: string;

  toJSON() {
    const json = super.toJSON(...arguments);
    if (!json['name']) {
      json['name'] = json['email'];
    }
    delete json['object'];
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
