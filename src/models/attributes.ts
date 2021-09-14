import Model from './model';
import RestfulModel from './restful-model';
import { NativeAuthenticationProvider } from './connect';

// The Attribute class represents a single model attribute, like 'namespace_id'
// Subclasses of Attribute like AttributeDateTime know how to covert between
// the JSON representation of that type and the javascript representation.
// The Attribute class also exposes convenience methods for generating Matchers.

export class Attribute {
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

  toJSON(val: any, _parent?: any): any {
    return val;
  }
  fromJSON(val: any, _parent: any): any {
    return val || null;
  }
}

class AttributeObject extends Attribute {
  itemClass?: typeof Model | typeof RestfulModel;

  constructor({
    modelKey,
    jsonKey,
    itemClass,
    readOnly,
  }: {
    modelKey: string;
    jsonKey?: string;
    itemClass?: typeof Model | typeof RestfulModel;
    readOnly?: boolean;
  }) {
    super({ modelKey, jsonKey, readOnly });
    this.itemClass = itemClass;
  }

  toJSON(val: any, _parent: any): any {
    if (!val) {
      return val;
    }
    if (val.toJSON != null) {
      return val.toJSON();
    }
    return val;
  }

  fromJSON(val: any, _parent: any): any {
    if (!val || !this.itemClass) {
      return val;
    }

    if (this.itemClass.prototype instanceof RestfulModel) {
      return new this.itemClass(_parent.connection).fromJSON(val);
    }
    return new this.itemClass(val).fromJSON(val);
  }
}

class AttributeNumber extends Attribute {
  toJSON(val: any): any {
    return val;
  }
  fromJSON(val: any, _parent: any): number | null {
    if (!isNaN(val)) {
      return Number(val);
    } else {
      return null;
    }
  }
}

class AttributeBoolean extends Attribute {
  toJSON(val: any): any {
    return val;
  }
  fromJSON(val: any, _parent: any): boolean {
    return val === 'true' || val === true || false;
  }
}

class AttributeString extends Attribute {
  toJSON(val: any): any {
    return val;
  }
  fromJSON(val: any, _parent: any): any {
    return val || '';
  }
}

class AttributeStringList extends Attribute {
  toJSON(val: any): any {
    return val;
  }
  fromJSON(val: any, _parent: any): any {
    return val || [];
  }
}

class AttributeDate extends Attribute {
  toJSON(val: any): any {
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
  toJSON(val: any): number | null {
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

  fromJSON(val: any, _parent: any): Date | null {
    if (!val) {
      return null;
    }
    return new Date(val * 1000);
  }
}

class AttributeCollection extends Attribute {
  itemClass: typeof Model | typeof RestfulModel;

  constructor({
    modelKey,
    jsonKey,
    itemClass,
    readOnly,
  }: {
    modelKey: string;
    jsonKey?: string;
    itemClass: typeof Model | typeof RestfulModel;
    readOnly?: boolean;
  }) {
    super({ modelKey, jsonKey, readOnly });
    this.itemClass = itemClass;
  }

  toJSON(vals: any, _parent: any): any[] {
    if (!vals) {
      return [];
    }
    const json = [];
    for (const val of vals) {
      if (val.toJSON != null) {
        json.push(val.toJSON());
      } else {
        json.push(val);
      }
    }
    return json;
  }

  fromJSON(json: any, _parent: any): any[] {
    if (!json || !(json instanceof Array)) {
      return [];
    }
    const objs = [];
    for (const objJSON of json) {
      let obj;
      if (this.itemClass.prototype instanceof RestfulModel) {
        obj = new this.itemClass(_parent.connection).fromJSON(objJSON);
      } else {
        obj = new this.itemClass(objJSON).fromJSON(objJSON);
      }
      objs.push(obj);
    }
    return objs;
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

  fromJSON(val: any, _parent: any): any {
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
    for (const v in val) {
      enumList.push(v.toString());
    }
    return enumList;
  }

  fromJSON(val: any[], _parent: any): any[] {
    const enumList: any[] = [];
    for (const v in val) {
      if (Object.values(this.itemClass).includes(val[v])) {
        enumList.push(val[v]);
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
