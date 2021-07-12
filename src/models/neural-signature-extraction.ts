import NeuralSignatureContact from './neural-signature-contact';
import Attributes from './attributes';
import Message from './message';

export default class NeuralSignatureExtraction extends Message {
  signature?: string;
  modelVersion?: string;
  contacts?: NeuralSignatureContact;
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
