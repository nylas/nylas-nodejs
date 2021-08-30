import Attributes from './attributes';
import File, { FileProperties } from './file';
import NylasConnection from '../nylas-connection';

export interface NeuralOcrProperties extends FileProperties {
  ocr: string[];
  processedPages: number;
}

export default class NeuralOcr extends File implements NeuralOcrProperties {
  ocr = [];
  processedPages = 0;

  constructor(connection: NylasConnection, props?: NeuralOcrProperties) {
    super(connection, props);
  }
}

NeuralOcr.collectionName = 'ocr';
NeuralOcr.attributes = {
  ...File.attributes,
  ocr: Attributes.StringList({
    modelKey: 'ocr',
  }),
  processedPages: Attributes.Number({
    modelKey: 'processedPages',
    jsonKey: 'processed_pages',
  }),
};
