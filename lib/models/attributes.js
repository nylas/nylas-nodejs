(function() {
  var Attribute, AttributeBoolean, AttributeCollection, AttributeDateTime, AttributeNumber, AttributeString, AttributeStringList,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Attribute = (function() {
    function Attribute(arg) {
      var jsonKey, modelKey, queryable;
      modelKey = arg.modelKey, queryable = arg.queryable, jsonKey = arg.jsonKey;
      this.modelKey = modelKey;
      this.jsonKey = jsonKey || modelKey;
      this.queryable = queryable;
      this;
    }

    Attribute.prototype.toJSON = function(val) {
      return val;
    };

    Attribute.prototype.fromJSON = function(val, parent) {
      return val || null;
    };

    return Attribute;

  })();

  AttributeNumber = (function(superClass) {
    extend(AttributeNumber, superClass);

    function AttributeNumber() {
      return AttributeNumber.__super__.constructor.apply(this, arguments);
    }

    AttributeNumber.prototype.toJSON = function(val) {
      return val;
    };

    AttributeNumber.prototype.fromJSON = function(val, parent) {
      if (!isNaN(val)) {
        return Number(val);
      } else {
        return null;
      }
    };

    return AttributeNumber;

  })(Attribute);

  AttributeBoolean = (function(superClass) {
    extend(AttributeBoolean, superClass);

    function AttributeBoolean() {
      return AttributeBoolean.__super__.constructor.apply(this, arguments);
    }

    AttributeBoolean.prototype.toJSON = function(val) {
      return val;
    };

    AttributeBoolean.prototype.fromJSON = function(val, parent) {
      return (val === 'true' || val === true) || false;
    };

    return AttributeBoolean;

  })(Attribute);

  AttributeString = (function(superClass) {
    extend(AttributeString, superClass);

    function AttributeString() {
      return AttributeString.__super__.constructor.apply(this, arguments);
    }

    AttributeString.prototype.toJSON = function(val) {
      return val;
    };

    AttributeString.prototype.fromJSON = function(val, parent) {
      return val || "";
    };

    return AttributeString;

  })(Attribute);

  AttributeStringList = (function(superClass) {
    extend(AttributeStringList, superClass);

    function AttributeStringList() {
      return AttributeStringList.__super__.constructor.apply(this, arguments);
    }

    AttributeStringList.prototype.toJSON = function(val) {
      return val;
    };

    AttributeStringList.prototype.fromJSON = function(val, parent) {
      return val || [];
    };

    return AttributeStringList;

  })(Attribute);

  AttributeDateTime = (function(superClass) {
    extend(AttributeDateTime, superClass);

    function AttributeDateTime() {
      return AttributeDateTime.__super__.constructor.apply(this, arguments);
    }

    AttributeDateTime.prototype.toJSON = function(val) {
      if (!val) {
        return null;
      }
      if (!(val instanceof Date)) {
        throw new Error("Attempting to toJSON AttributeDateTime which is not a date: " + this.modelKey + " = " + val);
      }
      return val.getTime() / 1000.0;
    };

    AttributeDateTime.prototype.fromJSON = function(val, parent) {
      if (!val) {
        return null;
      }
      return new Date(val * 1000);
    };

    return AttributeDateTime;

  })(Attribute);

  AttributeCollection = (function(superClass) {
    extend(AttributeCollection, superClass);

    function AttributeCollection(arg) {
      var itemClass, jsonKey, modelKey;
      modelKey = arg.modelKey, jsonKey = arg.jsonKey, itemClass = arg.itemClass;
      AttributeCollection.__super__.constructor.apply(this, arguments);
      this.itemClass = itemClass;
      this;
    }

    AttributeCollection.prototype.toJSON = function(vals) {
      var i, json, len, val;
      if (!vals) {
        return [];
      }
      json = [];
      for (i = 0, len = vals.length; i < len; i++) {
        val = vals[i];
        if (val.toJSON != null) {
          json.push(val.toJSON());
        } else {
          json.push(val);
        }
      }
      return json;
    };

    AttributeCollection.prototype.fromJSON = function(json, parent) {
      var i, len, obj, objJSON, objs;
      if (!(json && json instanceof Array)) {
        return [];
      }
      objs = [];
      for (i = 0, len = json.length; i < len; i++) {
        objJSON = json[i];
        obj = new this.itemClass(parent.connection, objJSON);
        objs.push(obj);
      }
      return objs;
    };

    return AttributeCollection;

  })(Attribute);

  module.exports = {
    Number: function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(AttributeNumber, arguments, function(){});
    },
    String: function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(AttributeString, arguments, function(){});
    },
    StringList: function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(AttributeStringList, arguments, function(){});
    },
    DateTime: function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(AttributeDateTime, arguments, function(){});
    },
    Collection: function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(AttributeCollection, arguments, function(){});
    },
    Boolean: function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(AttributeBoolean, arguments, function(){});
    },
    Object: function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(Attribute, arguments, function(){});
    },
    AttributeNumber: AttributeNumber,
    AttributeString: AttributeString,
    AttributeStringList: AttributeStringList,
    AttributeDateTime: AttributeDateTime,
    AttributeCollection: AttributeCollection,
    AttributeBoolean: AttributeBoolean
  };

}).call(this);
