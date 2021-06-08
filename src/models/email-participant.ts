import RestfulModel from './restful-model';
import Attributes from './attributes';

export default class EmailParticipant extends RestfulModel {
  name?: string;
  email?: string;

  toJSON(enforceReadOnly?: boolean) {
    const json = super.toJSON(enforceReadOnly);
    if (!json['name']) {
      json['name'] = json['email'];
    }
    return json;
  }
}
EmailParticipant.collectionName = 'email-participants';
EmailParticipant.attributes = {
  name: Attributes.String({
    modelKey: 'name',
  }),
  email: Attributes.String({
    modelKey: 'email',
  }),
};
