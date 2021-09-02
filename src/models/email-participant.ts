import Attributes from './attributes';
import Model from './model';

export interface EmailParticipantProperties {
  email: string;
  name?: string;
}

export default class EmailParticipant extends Model
  implements EmailParticipantProperties {
  email!: string;
  name?: string;

  constructor(props?: EmailParticipantProperties) {
    super(props);
    if(!props) {
      this.email = "";
    }
  }

  toJSON(): EmailParticipantProperties {
    const json = super.toJSON();
    if (!json['name']) {
      json['name'] = json['email'];
    }
    return json;
  }
}
EmailParticipant.attributes = {
  name: Attributes.String({
    modelKey: 'name',
  }),
  email: Attributes.String({
    modelKey: 'email',
  }),
};
