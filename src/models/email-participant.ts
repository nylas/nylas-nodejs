import Attributes, { Attribute } from './attributes';
import Model from './model';

export type EmailParticipantProperties = {
  email: string;
  name?: string;
};

export default class EmailParticipant extends Model
  implements EmailParticipantProperties {
  email = '';
  name?: string;
  static attributes: Record<string, Attribute> = {
    name: Attributes.String({
      modelKey: 'name',
    }),
    email: Attributes.String({
      modelKey: 'email',
    }),
  };

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
