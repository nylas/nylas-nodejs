import Attributes, { Attribute } from './attributes';
import Message, { MessageProperties } from './message';
import Model from './model';
import NylasConnection from '../nylas-connection';

export type CategorizeProperties = {
  category: string;
  categorizedAt: Date;
  modelVersion: string;
  subcategories: string[];
};

export class Categorize extends Model implements CategorizeProperties {
  category = '';
  categorizedAt: Date = new Date();
  modelVersion = '';
  subcategories: string[] = [];
  static attributes: Record<string, Attribute> = {
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

  constructor(props?: CategorizeProperties) {
    super();
    this.initAttributes(props);
  }
}

export type NeuralCategorizerProperties = MessageProperties & {
  categorizer: Categorize;
};

export default class NeuralCategorizer extends Message
  implements NeuralCategorizerProperties {
  categorizer = new Categorize();
  static collectionName = 'categorizer';
  static attributes: Record<string, Attribute> = {
    ...Message.attributes,
    categorizer: Attributes.Object({
      modelKey: 'categorizer',
      itemClass: Categorize,
    }),
  };

  constructor(
    connection: NylasConnection,
    props?: NeuralCategorizerProperties
  ) {
    super(connection, props);
    this.initAttributes(props);
  }

  reCategorize(category: string): Promise<NeuralCategorizer> {
    return this.connection
      .request({
        method: 'POST',
        path: '/neural/categorize/feedback',
        body: { message_id: this.id, category: category },
      })
      .then(async json => {
        const categorizeResponse = await this.connection.neural.categorize([
          json['message_id'],
        ]);
        return categorizeResponse[0];
      });
  }
}
