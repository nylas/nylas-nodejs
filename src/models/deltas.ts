import Model from './model';
import NylasConnection from '../nylas-connection';
import Attributes, { Attribute } from './attributes';
import Delta, { DeltaProperties } from './delta';

export type DeltasProperties = {
  cursorStart: string;
  cursorEnd: string;
  deltas: DeltaProperties[];
};

export class Deltas extends Model implements DeltasProperties {
  cursorStart = '';
  cursorEnd = '';
  deltas: Delta[] = [];
  connection: NylasConnection;
  static attributes: Record<string, Attribute> = {
    cursorStart: Attributes.String({
      modelKey: 'cursorStart',
      jsonKey: 'cursor_start',
    }),
    cursorEnd: Attributes.String({
      modelKey: 'cursorEnd',
      jsonKey: 'cursor_end',
    }),
    deltas: Attributes.Collection({
      modelKey: 'deltas',
      itemClass: Delta,
    }),
  };

  constructor(connection: NylasConnection, props?: DeltasProperties) {
    super();
    this.connection = connection;
    this.initAttributes(props);
  }
}
