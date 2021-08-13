import RestfulModel from './restful-model';
import Attributes from './attributes';

class EventConferencingDetails extends RestfulModel {
  meetingCode?: string;
  phone?: string[];
  password?: string;
  pin?: string;
  url?: string;

  toJSON() {
    return {
      meeting_code: this.meetingCode,
      phone: this.phone,
      password: this.password,
      pin: this.pin,
      url: this.url,
    };
  }
}
EventConferencingDetails.collectionName = 'event_conferencing_details';
EventConferencingDetails.attributes = {
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

export class EventConferencing extends RestfulModel {
  details?: EventConferencingDetails;
  provider?: string;
  autocreate?: {
    settings?: object;
  };

  toJSON(): any {
    return {
      details: this.details,
      provider: this.provider,
      autocreate: this.autocreate,
    };
  }
}
EventConferencing.collectionName = 'event_conferencing';
EventConferencing.attributes = {
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
