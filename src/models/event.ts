import RestfulModel, { SaveCallback } from './restful-model';
import Attributes from './attributes';
import EventParticipant, {
  EventParticipantProperties,
} from './event-participant';
import {
  EventConferencing,
  EventConferencingProperties,
} from './event-conferencing';
import When, { WhenProperties } from './when';
import NylasConnection from '../nylas-connection';

export type EventProperties = {
  calendarId: string;
  when: WhenProperties;
  iCalUID?: string;
  messageId?: string;
  title?: string;
  description?: string;
  owner?: string;
  participants?: EventParticipantProperties[];
  readOnly?: boolean;
  location?: string;
  busy?: boolean;
  status?: string;
  recurrence?: {
    rrule: string[];
    timezone: string;
  };
  masterEventId?: string;
  originalStartTime?: number;
  conferencing?: EventConferencingProperties;
  metadata?: object;
  jobStatusId?: string;
};

export default class Event extends RestfulModel {
  calendarId = '';
  when = new When();
  iCalUID?: string;
  messageId?: string;
  title?: string;
  description?: string;
  owner?: string;
  participants?: EventParticipant[];
  readOnly?: boolean;
  location?: string;
  busy?: boolean;
  status?: string;
  recurrence?: {
    rrule: string[];
    timezone: string;
  };
  masterEventId?: string;
  originalStartTime?: number;
  conferencing?: EventConferencing;
  metadata?: object;
  jobStatusId?: string;

  constructor(connection: NylasConnection, props?: EventProperties) {
    super(connection, props);
    this.initAttributes(props);
  }

  get start(): string | number | undefined {
    return (
      this.when?.startTime ||
      this.when?.startDate ||
      this.when?.time ||
      this.when?.date
    );
  }

  set start(val: string | number | undefined) {
    if (!this.when) {
      this.when = new When();
    }
    if (typeof val === 'number') {
      if (val === this.when.endTime) {
        this.when.time = val;
        this.when.endTime = undefined;
      } else {
        this.when.time = undefined;
        this.when.startDate = undefined;
        this.when.date = undefined;
        this.when.startTime = val;
      }
    }
    if (typeof val === 'string') {
      if (val === this.when.endDate) {
        this.when.date = val;
        this.when.endDate = undefined;
      } else {
        this.when.time = undefined;
        this.when.startTime = undefined;
        this.when.date = undefined;
        this.when.startDate = val;
      }
    }
  }

  get end(): string | number | undefined {
    return (
      this.when?.endTime ||
      this.when?.endDate ||
      this.when?.time ||
      this.when?.date
    );
  }

  set end(val: string | number | undefined) {
    if (!this.when) {
      this.when = new When();
    }
    if (typeof val === 'number') {
      if (val === this.when.startTime) {
        this.when.time = val;
        this.when.startTime = undefined;
      } else {
        this.when.time = undefined;
        this.when.endDate = undefined;
        this.when.date = undefined;
        this.when.endTime = val;
      }
    }
    if (typeof val === 'string') {
      if (val === this.when.startDate) {
        this.when.date = val;
        this.when.startDate = undefined;
      } else {
        this.when.time = undefined;
        this.when.endTime = undefined;
        this.when.date = undefined;
        this.when.endDate = val;
      }
    }
  }

  deleteRequestQueryString(
    params: Record<string, unknown> = {}
  ): Record<string, unknown> {
    const qs: Record<string, unknown> = {};
    if (params.hasOwnProperty('notify_participants')) {
      qs.notify_participants = params.notify_participants;
    }
    return qs;
  }

  save(params: {} | SaveCallback = {}, callback?: SaveCallback): Promise<this> {
    if (
      this.conferencing &&
      this.conferencing.details &&
      this.conferencing.autocreate
    ) {
      return Promise.reject(
        new Error(
          "Cannot set both 'details' and 'autocreate' in conferencing object."
        )
      );
    }
    return super.save(params, callback);
  }

  rsvp(
    status: string,
    comment: string,
    callback?: (error: Error | null, data?: Event) => void
  ): Promise<Event> {
    return this.connection
      .request({
        method: 'POST',
        body: { event_id: this.id, status: status, comment: comment },
        path: '/send-rsvp',
      })
      .then(json => {
        this.fromJSON(json);
        if (callback) {
          callback(null, this);
        }
        return Promise.resolve(this);
      })
      .catch(err => {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
  }
}
Event.collectionName = 'events';
Event.attributes = {
  ...RestfulModel.attributes,
  calendarId: Attributes.String({
    modelKey: 'calendarId',
    jsonKey: 'calendar_id',
  }),
  iCalUID: Attributes.String({
    modelKey: 'iCalUID',
    jsonKey: 'ical_uid',
    readOnly: true,
  }),
  messageId: Attributes.String({
    modelKey: 'messageId',
    jsonKey: 'message_id',
    readOnly: true,
  }),
  title: Attributes.String({
    modelKey: 'title',
  }),
  description: Attributes.String({
    modelKey: 'description',
  }),
  owner: Attributes.String({
    modelKey: 'owner',
    readOnly: true,
  }),
  participants: Attributes.Collection({
    modelKey: 'participants',
    itemClass: EventParticipant,
  }),
  readOnly: Attributes.Boolean({
    modelKey: 'readOnly',
    jsonKey: 'read_only',
  }),
  location: Attributes.String({
    modelKey: 'location',
  }),
  when: Attributes.Object({
    modelKey: 'when',
    itemClass: When,
  }),
  busy: Attributes.Boolean({
    modelKey: 'busy',
  }),
  status: Attributes.String({
    modelKey: 'status',
    readOnly: true,
  }),
  recurrence: Attributes.Object({
    modelKey: 'recurrence',
  }),
  masterEventId: Attributes.String({
    modelKey: 'masterEventId',
    jsonKey: 'master_event_id',
    readOnly: true,
  }),
  originalStartTime: Attributes.DateTime({
    modelKey: 'originalStartTime',
    jsonKey: 'original_start_time',
    readOnly: true,
  }),
  conferencing: Attributes.Object({
    modelKey: 'conferencing',
    itemClass: EventConferencing,
  }),
  metadata: Attributes.Object({
    modelKey: 'metadata',
  }),
  jobStatusId: Attributes.String({
    modelKey: 'jobStatusId',
    jsonKey: 'job_status_id',
    readOnly: true,
  }),
};
