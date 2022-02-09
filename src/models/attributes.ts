import Model from './model';
// The Attribute class represents a single model attribute, like 'namespace_id'
// Subclasses of Attribute like AttributeDateTime know how to covert between
// the JSON representation of that type and the javascript representation.
// The Attribute class also exposes convenience methods for generating Matchers.

type AnyModel = new (...args: any[]) => Model;
const isRestfulModel = (cls: any): boolean => {
  // A 'RestfulModel' has 'endpointName' and 'collectionName' unlike 'Model'
  return cls.endpointName !== undefined && cls.collectionName !== undefined;
};

export abstract class Attribute {
  modelKey: string;
  jsonKey: string;
  readOnly: boolean;

  constructor({
    modelKey,
    jsonKey,
    readOnly,
  }: {
    modelKey: string;
    jsonKey?: string;
    readOnly?: boolean;
  }) {
    this.modelKey = modelKey;
    this.jsonKey = jsonKey || modelKey;
    this.readOnly = readOnly || false;
  }

  abstract toJSON(val: any, _parent?: any): any;
  abstract fromJSON(val: any, _parent: any): any;

  saveRequestBody(val: any): any {
    if (this.readOnly) {
      return undefined;
    }

    return this.toJSON(val);
  }
}

class AttributeObject extends Attribute {
  itemClass?: any;

  constructor({
    modelKey,
    jsonKey,
    itemClass,
    readOnly,
  }: {
    modelKey: string;
    jsonKey?: string;
    itemClass?: AnyModel;
    readOnly?: boolean;
  }) {
    super({ modelKey, jsonKey, readOnly });
    this.itemClass = itemClass;
  }

  toJSON(val: any, saveRequestBody?: boolean): unknown {
    if (!val) {
      return val;
    }
    if (saveRequestBody === true && val.saveRequestBody != null) {
      return val.saveRequestBody();
    } else if (val.toJSON != null) {
      return val.toJSON();
    }
    return val;
  }

  fromJSON(val: any, _parent: any): any {
    if (!val || !this.itemClass) {
      return val;
    }

    if (isRestfulModel(this.itemClass)) {
      return new this.itemClass(_parent.connection, val).fromJSON(val);
    }
    return new this.itemClass(val).fromJSON(val);
  }

  saveRequestBody(val: any): unknown {
    if (this.readOnly) {
      return;
    }
    return this.toJSON(val, true);
  }
}

class AttributeNumber extends Attribute {
  toJSON(val: number): number {
    return val;
  }
  fromJSON(val: any): number | null {
    if (!isNaN(Number(val))) {
      return Number(val);
    } else {
      return null;
    }
  }
}

class AttributeNumberList extends Attribute {
  toJSON(val: any): number {
    return val;
  }
  fromJSON(json: any, _parent: any): number[] {
    if (!json || !(json instanceof Array)) {
      return [];
    }
    const nums = [];
    for (const num in json) {
      if (!isNaN(Number(num))) {
        nums.push(Number(num));
      }
    }
    return nums;
  }
}

class AttributeBoolean extends Attribute {
  toJSON(val: boolean): boolean {
    return val;
  }
  fromJSON(val: string | boolean): boolean {
    return val === 'true' || val === true || false;
  }
}

class AttributeString extends Attribute {
  toJSON(val: string): string {
    return val;
  }
  fromJSON(val: string): string {
    return val || '';
  }
}

class AttributeStringList extends Attribute {
  toJSON(val: []): [] {
    return val;
  }
  fromJSON(val: []): [] {
    return val || [];
  }
}

class AttributeDate extends Attribute {
  toJSON(val: Date): string {
    if (!val) {
      return val;
    }
    if (!(val instanceof Date)) {
      throw new Error(
        `Attempting to toJSON AttributeDate which is not a date:
          ${this.modelKey}
         = ${val}`
      );
    }
    return val.toISOString();
  }

  fromJSON(val: any, _parent: any): Date | null {
    if (!val) {
      return null;
    }
    return new Date(val);
  }
}

class AttributeDateTime extends Attribute {
  toJSON(val: Date): number | null {
    if (!val) {
      return null;
    }
    if (!(val instanceof Date)) {
      throw new Error(
        `Attempting to toJSON AttributeDateTime which is not a date:
          ${this.modelKey}
        = ${val}`
      );
    }
    return val.getTime() / 1000.0;
  }

  fromJSON(val: number, _parent: any): Date | null {
    if (!val) {
      return null;
    }
    return new Date(val * 1000);
  }
}

class AttributeCollection extends Attribute {
  itemClass: any;

  constructor({
    modelKey,
    jsonKey,
    itemClass,
    readOnly,
  }: {
    modelKey: string;
    jsonKey?: string;
    itemClass: AnyModel;
    readOnly?: boolean;
  }) {
    super({ modelKey, jsonKey, readOnly });
    this.itemClass = itemClass;
  }

  toJSON(vals: any, saveRequestBody?: boolean): AnyModel[] {
    if (!vals) {
      return [];
    }
    const json = [];
    for (const val of vals) {
      if (saveRequestBody === true && val.saveRequestBody != null) {
        json.push(val.saveRequestBody());
      } else if (val.toJSON != null) {
        json.push(val.toJSON());
      } else {
        json.push(val);
      }
    }
    return json;
  }

  fromJSON(json: unknown[], _parent: any): AnyModel[] {
    if (!json || !(json instanceof Array)) {
      return [];
    }
    const objs = [];
    for (const objJSON of json) {
      let obj;
      if (isRestfulModel(this.itemClass)) {
        obj = new this.itemClass(_parent.connection, objJSON).fromJSON(objJSON);
      } else {
        obj = new this.itemClass(objJSON).fromJSON(objJSON);
      }
      objs.push(obj);
    }
    return objs;
  }

  saveRequestBody(val: any): AnyModel[] | undefined {
    if (this.readOnly) {
      return;
    }
    return this.toJSON(val, true);
  }
}

class AttributeEnum extends Attribute {
  itemClass: any;

  constructor({
    modelKey,
    itemClass,
    jsonKey,
    readOnly,
  }: {
    modelKey: string;
    itemClass: any;
    jsonKey?: string;
    readOnly?: boolean;
  }) {
    super({ modelKey, jsonKey, readOnly });
    this.itemClass = itemClass;
  }

  toJSON(val: any): string {
    return val.toString();
  }

  fromJSON(val: unknown): unknown {
    if (Object.values(this.itemClass).includes(val)) {
      return val;
    }
    return;
  }
}

class AttributeEnumList extends Attribute {
  itemClass: any;

  constructor({
    modelKey,
    itemClass,
    jsonKey,
    readOnly,
  }: {
    modelKey: string;
    itemClass: any;
    jsonKey?: string;
    readOnly?: boolean;
  }) {
    super({ modelKey, jsonKey, readOnly });
    this.itemClass = itemClass;
  }

  toJSON(val: any[]): string[] {
    const enumList: string[] = [];
    for (const v of val) {
      enumList.push(v.toString());
    }
    return enumList;
  }

  fromJSON(val: any[], _parent: any): any[] {
    const enumList: any[] = [];
    for (const v of val) {
      if (Object.values(this.itemClass).includes(v)) {
        enumList.push(v);
      }
    }
    return enumList;
  }
}

const Attributes = {
  Number(
    ...args: ConstructorParameters<typeof AttributeNumber>
  ): AttributeNumber {
    return new AttributeNumber(...args);
  },
  NumberList(
    ...args: ConstructorParameters<typeof AttributeNumberList>
  ): AttributeNumberList {
    return new AttributeNumberList(...args);
  },
  String(
    ...args: ConstructorParameters<typeof AttributeString>
  ): AttributeString {
    return new AttributeString(...args);
  },
  StringList(
    ...args: ConstructorParameters<typeof AttributeStringList>
  ): AttributeStringList {
    return new AttributeStringList(...args);
  },
  DateTime(
    ...args: ConstructorParameters<typeof AttributeDateTime>
  ): AttributeDateTime {
    return new AttributeDateTime(...args);
  },
  Date(...args: ConstructorParameters<typeof AttributeDate>): AttributeDate {
    return new AttributeDate(...args);
  },
  Collection(
    ...args: ConstructorParameters<typeof AttributeCollection>
  ): AttributeCollection {
    return new AttributeCollection(...args);
  },
  Boolean(
    ...args: ConstructorParameters<typeof AttributeBoolean>
  ): AttributeBoolean {
    return new AttributeBoolean(...args);
  },
  Object(
    ...args: ConstructorParameters<typeof AttributeObject>
  ): AttributeObject {
    return new AttributeObject(...args);
  },
  Enum(...args: ConstructorParameters<typeof AttributeEnum>): AttributeEnum {
    return new AttributeEnum(...args);
  },
  EnumList(
    ...args: ConstructorParameters<typeof AttributeEnumList>
  ): AttributeEnumList {
    return new AttributeEnumList(...args);
  },
};
export default Attributes;
