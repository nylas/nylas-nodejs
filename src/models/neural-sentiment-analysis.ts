import Attributes from './attributes';
import RestfulModel from './restful-model';

/**
 * A class representing a Neural Sentiment Analysis response
 * @typedef {RestfulModel} NeuralSentimentAnalysis
 * @property {string} sentiment - The sentiment
 * @property {number} sentimentScore - The sentiment score
 * @property {number} processedLength - The processed length
 * @property {number} text - The text analyzed
 */
export default class NeuralSentimentAnalysis extends RestfulModel {
  sentiment?: string;
  sentimentScore?: number;
  processedLength?: number;
  text?: string;
}

NeuralSentimentAnalysis.collectionName = 'sentiment';
NeuralSentimentAnalysis.attributes = {
  ...RestfulModel.attributes,
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
