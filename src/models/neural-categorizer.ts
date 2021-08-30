import Attributes from './attributes';
import Message, { MessageProperties } from './message';
import Model from './model';
import NylasConnection from '../nylas-connection';

export interface CategorizeProperties {
  category: string;
  categorizedAt: Date;
  modelVersion: string;
  subcategories: string[];
}

export class Categorize extends Model implements CategorizeProperties {
  category = '';
  categorizedAt = new Date();
  modelVersion = '';
  subcategories = [];

  constructor(props?: CategorizeProperties) {
    super(props);
  }

  toJSON() {
    return {
      category: this.category,
      categorized_at: this.categorizedAt,
      model_version: this.modelVersion,
      subcategories: this.subcategories,
    };
  }
}

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

export interface NeuralCategorizerProperties extends MessageProperties {
  categorizer: Categorize;
}

export default class NeuralCategorizer extends Message
  implements NeuralCategorizerProperties {
  categorizer = new Categorize();

  constructor(
    connection: NylasConnection,
    props?: NeuralCategorizerProperties
  ) {
    super(connection, props);
  }

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
