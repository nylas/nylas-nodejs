import { Attribute } from './attributes';

export type SaveCallback = (error: Error | null, result?: any) => void;

export default class Model {
  static attributes: { [key: string]: Attribute };

  constructor(json?: any) {
    if (json) {
      this.fromJSON(json);
    }
  }

  static propsFromJSON(
    json: { [key: string]: any },
    parent: any
  ): { [key: string]: any } {
    const props: { [key: string]: any } = {};
    for (const attrName in this.attributes) {
      const attr = this.attributes[attrName];
      if (json[attr.jsonKey] !== undefined) {
        props[attrName] = attr.fromJSON(json[attr.jsonKey], parent);
      }
    }
    return props;
  }

  attributes(): { [key: string]: Attribute } {
    return (this.constructor as any).attributes;
  }

  //TODO::Maybe come up with a better name?
  initAttributes(props: { [key: string]: any }): void {
    const attributes = this.attributes();
    for (const prop in props) {
      const attr = attributes[prop];
      if (attr) {
        (this as any)[prop] = attr.fromJSON(props[prop], this);
      }
    }
  }

  fromJSON(json?: any): this {
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
        json[attr.jsonKey] = attr.toJSON((this as any)[attrName], this);
      }
    }
    return json;
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
