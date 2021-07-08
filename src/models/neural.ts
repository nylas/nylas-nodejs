import RestfulModel from './restful-model';
import NeuralSentimentAnalysis from './neural-sentiment-analysis';
import NeuralSignatureExtraction from './neural-signature-extraction';
import NeuralOcr from './neural-ocr';
import NeuralCategorizer, { Categorize } from './neural-categorizer';
import NeuralCleanConversation from './neural-clean-conversation';
import NeuralSignatureContact from './neural-signature-contact';

export type NeuralMessageOptions = {
  ignore_links?: boolean;
  ignore_images?: boolean;
  ignore_tables?: boolean;
  remove_conclusion_phrases?: boolean;
  images_as_markdowns?: boolean;
};

export default class Neural extends RestfulModel {
  sentimentAnalysisMessage(
    messageId: string
  ): Promise<NeuralSentimentAnalysis> {
    const body = { message_id: [messageId] };
    return this._sentimentAnalysis(body);
  }

  sentimentAnalysisText(text: string): Promise<NeuralSentimentAnalysis> {
    const body = { text: text };
    return this._sentimentAnalysis(body);
  }

  extractSignature(
    messageId: string,
    parseContact?: boolean,
    options?: NeuralMessageOptions
  ): Promise<NeuralSignatureExtraction> {
    let body: { [key: string]: any } = { message_id: [messageId] };
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

    return this._request(path, body).then(json => {
      if (Array.isArray(json)) {
        json = json[0];
      }
      const signature = new NeuralSignatureExtraction(this.connection, json);
      if (parseContact !== false) {
        signature.contacts = new NeuralSignatureContact(
          this.connection,
          signature.contacts
        );
      }
      return signature;
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

  categorize(messageId: string): Promise<NeuralCategorizer> {
    const body = { message_id: [messageId] };
    const path = 'categorize';
    return this._request(path, body).then(json => {
      if (Array.isArray(json)) {
        json = json[0];
      }
      const category = new NeuralCategorizer(this.connection, json);
      category.categorizer = new Categorize(
        this.connection,
        category.categorizer
      );
      return category;
    });
  }

  cleanConversation(
    messageId: string,
    options?: NeuralMessageOptions
  ): Promise<NeuralCleanConversation> {
    let body: { [key: string]: any } = { message_id: [messageId] };
    const path = 'conversation';

    if (options) {
      body = {
        ...body,
        ...options,
      };
    }

    return this._request(path, body).then(json => {
      if (Array.isArray(json)) {
        json = json[0];
      }
      return new NeuralCleanConversation(this.connection, json);
    });
  }

  _sentimentAnalysis(body: object): Promise<NeuralSentimentAnalysis> {
    const path = 'sentiment';
    return this._request(path, body).then(json => {
      if (Array.isArray(json)) {
        json = json[0];
      }
      return new NeuralSentimentAnalysis(this.connection, json);
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
