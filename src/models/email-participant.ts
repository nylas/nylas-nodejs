import Attributes from './attributes';
import Model from './model';

export type EmailParticipantProperties = {
  email: string;
  name?: string;
};

export default class EmailParticipant extends Model
  implements EmailParticipantProperties {
  email = '';
  name?: string;

  constructor(props?: EmailParticipantProperties) {
    super();
    this.initAttributes(props);
  }

  toJSON(): Record<string, unknown> {
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
