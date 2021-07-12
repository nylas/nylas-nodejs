import Attributes from './attributes';
import RestfulModel from './restful-model';

export default class NeuralSentimentAnalysis extends RestfulModel {
  account_id?: string;
  sentiment?: string;
  sentimentScore?: number;
  processedLength?: number;
  text?: string;
}

NeuralSentimentAnalysis.collectionName = 'sentiment';
NeuralSentimentAnalysis.attributes = {
  accountId: Attributes.String({
    modelKey: 'accountId',
    jsonKey: 'account_id',
  }),
  sentiment: Attributes.String({
    modelKey: 'sentiment',
  }),
  sentimentScore: Attributes.Number({
    modelKey: 'sentimentScore',
    jsonKey: 'sentiment_score',
  }),
  processedLength: Attributes.Number({
    modelKey: 'processedLength',
    jsonKey: 'processed_length',
  }),
  text: Attributes.String({
    modelKey: 'text',
  }),
};
