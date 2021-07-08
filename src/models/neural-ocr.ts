import Attributes from './attributes';
import File from './file';

export default class NeuralOcr extends File {
  ocr?: string[];
  processedPages?: number;
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
