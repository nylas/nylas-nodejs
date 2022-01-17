import Attributes from './attributes';
import Model from './model';

export type EventParticipantProperties = {
  email: string;
  name?: string;
  comment?: string;
  phoneNumber?: string;
  status?: string;
};

export default class EventParticipant extends Model
  implements EventParticipantProperties {
  email = '';
  name?: string;
  comment?: string;
  phoneNumber?: string;
  status?: string;

  constructor(props?: EventParticipantProperties) {
    super();
    this.initAttributes(props);
  }

  toJSON(enforceReadOnly?: boolean): Record<string, string> {
    const json = super.toJSON(enforceReadOnly) as Record<string, string>;
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
  comment: Attributes.String({
    modelKey: 'comment',
  }),
  phoneNumber: Attributes.String({
    modelKey: 'phoneNumber',
    jsonKey: 'phone_number',
  }),
  status: Attributes.String({
    modelKey: 'status',
    readOnly: true,
  }),
};
