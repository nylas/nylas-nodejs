import Attributes from './attributes';
import Message from './message';
import RestfulModel from './restful-model';

export class Categorize extends RestfulModel {
  category?: string;
  categorizedAt?: Date;
  modelVersion?: string;
  subcategories?: string[];

  toJSON() {
    return {
      category: this.category,
      categorized_at: this.categorizedAt,
      model_version: this.modelVersion,
      subcategories: this.subcategories,
    };
  }
}

Categorize.collectionName = 'categorize';
Categorize.attributes = {
  category: Attributes.String({
    modelKey: 'category',
  }),
  categorizedAt: Attributes.DateTime({
    modelKey: 'categorizedAt',
    jsonKey: 'categorized_at',
  }),
  modelVersion: Attributes.String({
    modelKey: 'modelVersion',
    jsonKey: 'model_version',
  }),
  subcategories: Attributes.StringList({
    modelKey: 'subcategories',
  }),
};

export default class NeuralCategorizer extends Message {
  categorizer?: Categorize;

  reCategorize(category: string): Promise<NeuralCategorizer> {
    return this.connection
      .request({
        method: 'POST',
        path: '/neural/categorize/feedback',
        body: { message_id: this.id, category: category },
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(async json => {
        const categorizeResponse = await this.connection.neural.categorize([
          json['message_id'],
        ]);
        return categorizeResponse[0];
      });
  }
}

NeuralCategorizer.collectionName = 'categorizer';
NeuralCategorizer.attributes = {
  ...Message.attributes,
  categorizer: Attributes.Object({
    modelKey: 'categorizer',
    itemClass: Categorize,
  }),
};
