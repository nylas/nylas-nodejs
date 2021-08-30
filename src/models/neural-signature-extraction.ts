import NeuralSignatureContact from './neural-signature-contact';
import Attributes from './attributes';
import Message, { MessageProperties } from './message';
import NylasConnection from '../nylas-connection';

export interface NeuralSignatureExtractionProperties extends MessageProperties {
  signature: string;
  modelVersion: string;
  contacts?: NeuralSignatureContact;
}

export default class NeuralSignatureExtraction extends Message
  implements NeuralSignatureExtractionProperties {
  signature = '';
  modelVersion = '';
  contacts?: NeuralSignatureContact;

  constructor(
    connection: NylasConnection,
    props?: NeuralSignatureExtractionProperties
  ) {
    super(connection, props);
  }
}

NeuralSignatureExtraction.collectionName = 'signature';
NeuralSignatureExtraction.attributes = {
  ...Message.attributes,
  signature: Attributes.String({
    modelKey: 'signature',
  }),
  modelVersion: Attributes.String({
    modelKey: 'modelVersion',
    jsonKey: 'model_version',
  }),
  contacts: Attributes.Object({
    modelKey: 'contacts',
    itemClass: NeuralSignatureContact,
  }),
};
