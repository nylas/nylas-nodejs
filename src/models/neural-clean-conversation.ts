import Message from './message';
import Attributes from './attributes';
import File from './file';

const IMAGE_REGEX = /[(']cid:(.)*[)']/g;

export default class NeuralCleanConversation extends Message {
  conversation?: string;
  modelVersion?: string;

  extractImages(): Promise<File[]> {
    const f: File[] = [];
    if (this.conversation) {
      const fileIds = this.conversation.match(IMAGE_REGEX);
      if (fileIds) {
        fileIds.forEach(async id => {
          const parsedId = id.substring(5, id.length - 1);
          const file = await this.connection.files.find(parsedId);
          f.push(file);
        });
      }
    }
    return Promise.resolve(f);
  }
}

NeuralCleanConversation.collectionName = 'conversation';
NeuralCleanConversation.attributes = {
  ...Message.attributes,
  conversation: Attributes.String({
    modelKey: 'conversation',
  }),
  modelVersion: Attributes.String({
    modelKey: 'modelVersion',
    jsonKey: 'model_version',
  }),
};
