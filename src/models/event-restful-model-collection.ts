import RestfulModelCollection from './restful-model-collection';
import Event, { EventProperties } from './event';
import NylasConnection from '../nylas-connection';
import { MetadataQuery, RestfulQuery } from './model-collection';

export interface EventQuery extends RestfulQuery {
  eventId?: string;
  calendarId?: string;
  title?: string;
  description?: string;
  location?: string;
  participants?: string;
  startsBefore?: Date | number;
  startsAfter?: Date | number;
  endsBefore?: Date | number;
  endsAfter?: Date | number;
  updatedAtBefore?: Date | number;
  updatedAtAfter?: Date | number;
  expandRecurring?: boolean;
  busy?: boolean;
  showCancelled?: boolean;
  metadata?: MetadataQuery;
}

export class EventRestfulModelCollection extends RestfulModelCollection<Event> {
  constructor(connection: NylasConnection) {
    super(Event, connection);
  }

  create(
    props: EventProperties,
    callback?: (error: Error | null, result?: Event) => void
  ): Promise<Event> {
    return new Event(this.connection, props).save(callback);
  }

  list(
    params: EventQuery,
    callback?: (error: Error | null, obj?: Event[]) => void
  ): Promise<Event[]> {
    return super.list(params, callback);
  }

  protected formatQuery(query: EventQuery): Record<string, unknown> {
    return {
      ...super.formatQuery(query),
      event_id: query.eventId,
      calendar_id: query.calendarId,
      title: query.title,
      description: query.description,
      location: query.location,
      participants: query.participants,
      starts_before: RestfulModelCollection.formatTimestampQuery(
        query.startsBefore
      ),
      starts_after: RestfulModelCollection.formatTimestampQuery(
        query.startsAfter
      ),
      ends_before: RestfulModelCollection.formatTimestampQuery(
        query.endsBefore
      ),
      ends_after: RestfulModelCollection.formatTimestampQuery(query.endsAfter),
      updatedAtBefore: RestfulModelCollection.formatTimestampQuery(
        query.updatedAtBefore
      ),
      updatedAtAfter: RestfulModelCollection.formatTimestampQuery(
        query.updatedAtAfter
      ),
      expand_recurring: query.expandRecurring,
      busy: query.busy,
      show_cancelled: query.showCancelled,
      metadata: this.formatMetadataQuery(query.metadata),
    };
  }
}
