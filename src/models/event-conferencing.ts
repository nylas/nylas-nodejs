import Attributes, { Attribute } from './attributes';
import Model from './model';

export type EventConferencingDetailsProperties = {
  meetingCode?: string;
  phone?: string[];
  password?: string;
  pin?: string;
  url?: string;
};

export class EventConferencingDetails extends Model
  implements EventConferencingDetailsProperties {
  meetingCode?: string;
  phone?: string[];
  password?: string;
  pin?: string;
  url?: string;
  static attributes: Record<string, Attribute> = {
    meetingCode: Attributes.String({
      modelKey: 'meetingCode',
      jsonKey: 'meeting_code',
    }),
    phone: Attributes.StringList({
      modelKey: 'phone',
    }),
    password: Attributes.String({
      modelKey: 'password',
    }),
    pin: Attributes.String({
      modelKey: 'pin',
    }),
    url: Attributes.String({
      modelKey: 'url',
    }),
  };

  constructor(props?: EventConferencingProperties) {
    super();
    this.initAttributes(props);
  }
}

export type EventConferencingProperties = {
  provider: string;
  details?: EventConferencingDetailsProperties;
  autocreate?: {
    settings?: object;
  };
};

export default class EventConferencing extends Model
  implements EventConferencingProperties {
  provider = '';
  details?: EventConferencingDetails;
  autocreate?: {
    settings?: Record<string, string>;
  };
  static attributes: Record<string, Attribute> = {
    details: Attributes.Object({
      modelKey: 'details',
      itemClass: EventConferencingDetails,
    }),
    provider: Attributes.String({
      modelKey: 'provider',
    }),
    autocreate: Attributes.Object({
      modelKey: 'autocreate',
    }),
  };

  constructor(props?: EventConferencingProperties) {
    super();
    this.initAttributes(props);
  }
}
