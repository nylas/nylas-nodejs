import NylasConnection from '../nylas-connection';
import Attributes, { Attribute } from './attributes';
import RestfulModel from './restful-model';
import Contact from './contact';
import File from './file';
import Message from './message';
import Draft from './draft';
import Thread from './thread';
import Event from './event';
import Folder, { Label } from './folder';

const DeltaClassMap: Record<string, typeof RestfulModel> = Object.freeze({
  contact: Contact,
  file: File,
  message: Message,
  draft: Draft,
  thread: Thread,
  event: Event,
  folder: Folder,
  label: Label,
});

export type DeltaParams = {
  view?: string;
  includeTypes?: string[];
  excludeTypes?: string[];
  expanded?: boolean;
};

export type DeltaProperties = {
  id: string;
  cursor: string;
  event: string;
  object: string;
  deltaAttributes?: unknown;
};

export default class Delta extends RestfulModel implements DeltaProperties {
  id = '';
  cursor = '';
  event = '';
  object = '';
  connection: NylasConnection;
  deltaAttributes?: RestfulModel;
  static streamingTimeoutMs = 15000;
  static attributes: Record<string, Attribute> = {
    id: Attributes.String({
      modelKey: 'id',
    }),
    cursor: Attributes.String({
      modelKey: 'cursor',
    }),
    event: Attributes.String({
      modelKey: 'event',
    }),
    object: Attributes.String({
      modelKey: 'object',
    }),
    deltaAttributes: Attributes.Object({
      modelKey: 'deltaAttributes',
      jsonKey: 'attributes',
    }),
  };

  constructor(connection: NylasConnection, props?: DeltaProperties) {
    super(connection);
    this.connection = connection;
    this.initAttributes(props);
    if (this.deltaAttributes && DeltaClassMap[this.object]) {
      this.deltaAttributes = new DeltaClassMap[this.object](
        connection,
        this.deltaAttributes
      );
    }
  }

  fromJSON(json: Record<string, unknown>): this {
    super.fromJSON(json);
    if (this.deltaAttributes && DeltaClassMap[this.object]) {
      this.deltaAttributes = new DeltaClassMap[this.object](
        this.connection
      ).fromJSON(this.deltaAttributes);
    }
    return this;
  }
}
