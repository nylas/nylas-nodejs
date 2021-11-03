import RestfulModel from './restful-model';
import Attributes from './attributes';

export class EventNotification extends RestfulModel {
  type?: string;
  minutesBeforeEvent?: number;
  url?: string;
  payload?: string;
  subject?: string;
  body?: string;
  message?: string;

  toJSON(): any {
    return {
      type: this.type,
      minutes_before_event: this.minutesBeforeEvent,
      url: this.url,
      payload: this.payload,
      subject: this.subject,
      body: this.body,
      message: this.message,
    };
  }
}
EventNotification.collectionName = 'event_notification';
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
