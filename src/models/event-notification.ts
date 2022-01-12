import Attributes from './attributes';
import Model from './model';

export enum EventNotificationType {
  Email = 'email',
  Sms = 'sms',
  Webhook = 'webhook',
}

export type EventNotificationProperties = {
  type: EventNotificationType;
  minutesBeforeEvent: number;
  url?: string;
  payload?: string;
  subject?: string;
  body?: string;
  message?: string;
};

export default class EventNotification extends Model
  implements EventNotificationProperties {
  type = EventNotificationType.Email;
  minutesBeforeEvent = 0;
  url?: string;
  payload?: string;
  subject?: string;
  body?: string;
  message?: string;

  constructor(props?: EventNotificationProperties) {
    super();
    this.initAttributes(props);
  }
}
EventNotification.attributes = {
  type: Attributes.String({
    modelKey: 'type',
  }),
  minutesBeforeEvent: Attributes.Number({
    modelKey: 'minutesBeforeEvent',
    jsonKey: 'minutes_before_event',
  }),
  url: Attributes.String({
    modelKey: 'url',
  }),
  payload: Attributes.String({
    modelKey: 'payload',
  }),
  subject: Attributes.String({
    modelKey: 'subject',
  }),
  body: Attributes.String({
    modelKey: 'body',
  }),
  message: Attributes.String({
    modelKey: 'message',
  }),
};
