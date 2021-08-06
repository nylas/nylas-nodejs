import RestfulModel from './restful-model';
import NeuralSentimentAnalysis from './neural-sentiment-analysis';
import NeuralSignatureExtraction from './neural-signature-extraction';
import NeuralOcr from './neural-ocr';
import NeuralCategorizer from './neural-categorizer';
import NeuralCleanConversation from './neural-clean-conversation';

export type NeuralMessageOptions = {
  ignore_links?: boolean;
  ignore_images?: boolean;
  ignore_tables?: boolean;
  remove_conclusion_phrases?: boolean;
  images_as_markdowns?: boolean;
};

export default class Neural extends RestfulModel {
  sentimentAnalysisMessage(
    messageIds: string[]
  ): Promise<NeuralSentimentAnalysis[]> {
    const body = { message_id: messageIds };
    const path = 'sentiment';

    return this._request(path, body).then((jsonArray: any) => {
      return jsonArray.map((json: any) => {
        return new NeuralSentimentAnalysis(this.connection, json);
      });
    });
  }

  sentimentAnalysisText(text: string): Promise<NeuralSentimentAnalysis> {
    const body = { text: text };
    const path = 'sentiment';

    return this._request(path, body).then(json => {
      return new NeuralSentimentAnalysis(this.connection, json);
    });
  }

  extractSignature(
    messageIds: string[],
    parseContact?: boolean,
    options?: NeuralMessageOptions
  ): Promise<NeuralSignatureExtraction[]> {
    let body: { [key: string]: any } = { message_id: messageIds };
    const path = 'signature';

    if (options) {
      body = {
        ...body,
        ...options,
      };
    }
    if (parseContact) {
      body['parse_contact'] = parseContact;
    }

    return this._request(path, body).then((jsonArray: any) => {
      return jsonArray.map((json: any) => {
        return new NeuralSignatureExtraction(this.connection, json);
      });
    });
  }

  ocrRequest(fileId: string, pages?: number[]): Promise<NeuralOcr> {
    const body: { [key: string]: any } = { file_id: fileId };
    const path = 'ocr';

    if (pages) {
      body['pages'] = pages;
    }

    return this._request(path, body).then(json => {
      return new NeuralOcr(this.connection, json);
    });
  }

  categorize(messageIds: string[]): Promise<NeuralCategorizer[]> {
    const body = { message_id: messageIds };
    const path = 'categorize';

    return this._request(path, body).then((jsonArray: any) => {
      return jsonArray.map((json: any) => {
        return new NeuralCategorizer(this.connection, json);
      });
    });
  }

  cleanConversation(
    messageIds: string[],
    options?: NeuralMessageOptions
  ): Promise<NeuralCleanConversation[]> {
    let body: { [key: string]: any } = { message_id: messageIds };
    const path = 'conversation';

    if (options) {
      body = {
        ...body,
        ...options,
      };
    }

    return this._request(path, body).then((jsonArray: any) => {
      return jsonArray.map((json: any) => {
        return new NeuralCleanConversation(this.connection, json);
      });
    });
  }

  _request(path?: string, body?: object): Promise<any> {
    if (!path) {
      path = (this.constructor as any).collectionName;
    }
    return this.connection.request({
      method: 'PUT',
      path: `/neural/${path}`,
      body: body,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
