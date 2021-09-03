import { Attribute } from './attributes';

export type SaveCallback = (error: Error | null, result?: any) => void;

export default class Model {
  static attributes: { [key: string]: Attribute };

  constructor(json?: any) {
    if (json) {
      this.fromJSON(json);
    }
  }

  attributes(): { [key: string]: Attribute } {
    return (this.constructor as any).attributes;
  }

  fromJSON(json?: any): Model {
    const attributes = this.attributes();
    for (const attrName in attributes) {
      const attr = attributes[attrName];
      if (json[attr.jsonKey] !== undefined) {
        (this as any)[attrName] = attr.fromJSON(json[attr.jsonKey], this);
      }
    }
    return this;
  }

  toJSON(enforceReadOnly?: boolean): any {
    const json: any = {};
    const attributes = this.attributes();
    for (const attrName in attributes) {
      if (!enforceReadOnly || !attributes[attrName].readOnly) {
        const attr = attributes[attrName];
        json[attr.jsonKey] = attr.toJSON((this as any)[attrName]);
      }
    }
    return json;
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
