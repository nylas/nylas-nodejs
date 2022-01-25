import NeuralSignatureContact from './neural-signature-contact';
import Attributes, { Attribute } from './attributes';
import Message, { MessageProperties } from './message';
import NylasConnection from '../nylas-connection';

export type NeuralSignatureExtractionProperties = MessageProperties & {
  signature: string;
  modelVersion: string;
  contacts?: NeuralSignatureContact;
};

export default class NeuralSignatureExtraction extends Message
  implements NeuralSignatureExtractionProperties {
  signature = '';
  modelVersion = '';
  contacts?: NeuralSignatureContact;
  static collectionName = 'signature';
  static attributes: Record<string, Attribute> = {
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

  constructor(
    connection: NylasConnection,
    props?: NeuralSignatureExtractionProperties
  ) {
    super(connection, props);
    this.initAttributes(props);
  }
}
