import Attributes, { Attribute } from './attributes';
import File, { FileProperties } from './file';
import NylasConnection from '../nylas-connection';

export type NeuralOcrProperties = FileProperties & {
  ocr: string[];
  processedPages: number;
};

export default class NeuralOcr extends File implements NeuralOcrProperties {
  ocr: string[] = [];
  processedPages = 0;
  static collectionName = 'ocr';
  static attributes: Record<string, Attribute> = {
    ...File.attributes,
    ocr: Attributes.StringList({
      modelKey: 'ocr',
    }),
    processedPages: Attributes.Number({
      modelKey: 'processedPages',
      jsonKey: 'processed_pages',
    }),
  };

  constructor(connection: NylasConnection, props?: NeuralOcrProperties) {
    super(connection, props);
    this.initAttributes(props);
  }
}
