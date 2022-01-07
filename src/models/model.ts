import { Attribute } from './attributes';

export type SaveCallback = (error: Error | null, result?: any) => void;

export default class Model {
  static attributes: Record<string, Attribute>;

  static propsFromJSON(
    json: Record<string, unknown>,
    parent: unknown
  ): Record<string, unknown> {
    const props: Record<string, unknown> = {};
    for (const attrName in this.attributes) {
      const attr = this.attributes[attrName];
      if (json[attr.jsonKey] !== undefined) {
        props[attrName] = attr.fromJSON(json[attr.jsonKey], parent);
      }
    }
    return props;
  }

  attributes(): Record<string, Attribute> {
    return (this.constructor as any).attributes;
  }

  //TODO::Maybe come up with a better name?
  initAttributes(props?: Record<string, unknown>): void {
    const attributes = this.attributes();
    for (const prop in props) {
      if (props.hasOwnProperty(prop)) {
        const attr = attributes[prop];
        if (attr) {
          (this as any)[prop] = attr.fromJSON(props[prop], this);
        }
      }
    }
  }

  fromJSON(json: Record<string, unknown>): this {
    const attributes = this.attributes();
    for (const attrName in attributes) {
      const attr = attributes[attrName];
      if (json[attr.jsonKey] !== undefined) {
        (this as any)[attrName] = attr.fromJSON(json[attr.jsonKey], this);
      }
    }
    return this;
  }

  toJSON(enforceReadOnly?: boolean): Record<string, unknown> {
    const json: Record<string, unknown> = {};
    const attributes = this.attributes();
    for (const attrName in attributes) {
      const attr = attributes[attrName];
      if (enforceReadOnly === true) {
        json[attr.jsonKey] = attr.saveRequestBody((this as any)[attrName]);
      } else {
        json[attr.jsonKey] = attr.toJSON((this as any)[attrName]);
      }
    }
    return json;
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
