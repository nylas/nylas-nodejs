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
        // After applying the regex, if there are IDs found they would be
        // in the form of => 'cid:xxxx' (including apostrophes), so we discard
        // everything before and after the file ID (denoted as xxxx above)
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
