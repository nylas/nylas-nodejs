import Attributes from './attributes';
import RestfulModel from './restful-model';
import NylasConnection from '../nylas-connection';

export interface NeuralSentimentAnalysisProperties {
  accountId: string;
  sentiment: string;
  sentimentScore: number;
  processedLength: number;
  text: string;
}

export default class NeuralSentimentAnalysis extends RestfulModel
  implements NeuralSentimentAnalysisProperties {
  accountId!: string;
  sentiment!: string;
  sentimentScore!: number;
  processedLength!: number;
  text!: string;

  constructor(
    connection: NylasConnection,
    props?: NeuralSentimentAnalysisProperties
  ) {
    super(connection, props);
    if(props) {
      this.accountId = '';
      this.sentiment = '';
      this.sentimentScore = 0;
      this.processedLength = 0;
      this.text = '';
    }
  }
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
