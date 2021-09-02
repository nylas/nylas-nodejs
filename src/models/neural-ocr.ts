import Attributes from './attributes';
import File, { FileProperties } from './file';
import NylasConnection from '../nylas-connection';

export interface NeuralOcrProperties extends FileProperties {
  ocr: string[];
  processedPages: number;
}

export default class NeuralOcr extends File implements NeuralOcrProperties {
  ocr!: string[];
  processedPages!: number;

  constructor(connection: NylasConnection, props?: NeuralOcrProperties) {
    super(connection, props);
    if(!props) {
      this.ocr = [];
      this.processedPages = 0;
    }
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
