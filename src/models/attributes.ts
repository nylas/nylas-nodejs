import RestfulModel from "./restful-model";

// The Attribute class represents a single model attribute, like 'namespace_id'
// Subclasses of Attribute like AttributeDateTime know how to covert between
// the JSON representation of that type and the javascript representation.
// The Attribute class also exposes convenience methods for generating Matchers.

export class Attribute {
  modelKey: string;
  jsonKey: string;
  itemClass?: typeof RestfulModel;

  constructor({ modelKey, jsonKey, itemClass }: { modelKey: string; jsonKey?: string, itemClass?: typeof RestfulModel }) {
    this.modelKey = modelKey;
    this.jsonKey = jsonKey || modelKey;
    this.itemClass = itemClass;
  }

  toJSON(val: any) {
    return val;
  }
  fromJSON(val: any, parent: any) {
    if (this.itemClass) {
      return new this.itemClass(val);
    }
    return val || null;
  }
}

export class AttributeNumber extends Attribute {
  toJSON(val: any) {
    return val;
  }
  fromJSON(val: any, parent: any) {
    if (!isNaN(val)) {
      return Number(val);
    } else {
      return null;
    }
  }
}

export class AttributeBoolean extends Attribute {
  toJSON(val: any) {
    return val;
  }
  fromJSON(val: any, parent: any) {
    return val === "true" || val === true || false;
  }
}

export class AttributeString extends Attribute {
  toJSON(val: any) {
    return val;
  }
  fromJSON(val: any, parent: any) {
    return val || "";
  }
}

export class AttributeStringList extends Attribute {
  toJSON(val: any) {
    return val;
  }
  fromJSON(val: any, parent: any) {
    return val || [];
  }
}

export class AttributeDate extends Attribute {
  toJSON(val: Date) {
    if (!val) {
      return val;
    }
    if (!(val instanceof global.Date)) {
      throw new Error(
        `Attempting to toJSON AttributeDate which is not a date: ${
          this.modelKey
        } = ${val}`
      );
    }
    return val.toISOString();
  }

  fromJSON(val: string | number | Date, parent: any) {
    if (!val) {
      return null;
    }
    return new global.Date(val);
  }
}

export class AttributeDateTime extends Attribute {
  toJSON(val: any) {
    if (!val) {
      return null;
    }
    if (!(val instanceof global.Date)) {
      throw new Error(
        `Attempting to toJSON AttributeDateTime which is not a date: ${
          this.modelKey
        } = ${val}`
      );
    }
    return val.getTime() / 1000.0;
  }

  fromJSON(val: number, parent: any) {
    if (!val) {
      return null;
    }
    return new global.Date(val * 1000);
  }
}

export class AttributeCollection extends Attribute {
  itemClass: typeof RestfulModel;

  constructor({
    modelKey,
    jsonKey,
    itemClass
  }: {
    modelKey: string;
    jsonKey?: string;
    itemClass: typeof RestfulModel;
  }) {
    super({ modelKey, jsonKey });
    this.itemClass = itemClass;
  }

  toJSON(vals: any) {
    if (!vals) {
      return [];
    }
    const json: object[] = [];
    for (const val of vals) {
      if (val.toJSON != null) {
        json.push(val.toJSON());
      } else {
        json.push(val);
      }
    }
    return json;
  }

  fromJSON(json: any[], parent: any) {
    if (!json || !(json instanceof Array)) {
      return [];
    }
    const objs = [];
    for (const objJSON of json) {
      const obj = new this.itemClass(parent.connection, objJSON);
      objs.push(obj);
    }
    return objs;
  }
}

const Attributes = {
  Number(...args: ConstructorParameters<typeof AttributeNumber>) {
    return new AttributeNumber(...args);
  },
  String(...args: ConstructorParameters<typeof AttributeString>) {
    return new AttributeString(...args);
  },
  StringList(...args: ConstructorParameters<typeof AttributeStringList>) {
    return new AttributeStringList(...args);
  },
  DateTime(...args: ConstructorParameters<typeof AttributeDateTime>) {
    return new AttributeDateTime(...args);
  },
  Date(...args: ConstructorParameters<typeof AttributeDate>) {
    return new AttributeDate(...args);
  },
  Collection(...args: ConstructorParameters<typeof AttributeCollection>) {
    return new AttributeCollection(...args);
  },
  Boolean(...args: ConstructorParameters<typeof AttributeBoolean>) {
    return new AttributeBoolean(...args);
  },
  Object(...args: ConstructorParameters<typeof Attribute>) {
    return new Attribute(...args);
  }
};
export default Attributes;
