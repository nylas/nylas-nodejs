(function() {
  var APIError,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  APIError = (function(superClass) {
    extend(APIError, superClass);

    function APIError(arg) {
      var ref, ref1, ref2, ref3, ref4, ref5;
      ref = arg != null ? arg : {}, this.error = ref.error, this.response = ref.response, this.body = ref.body, this.requestOptions = ref.requestOptions, this.statusCode = ref.statusCode;
      if (this.statusCode == null) {
        this.statusCode = (ref1 = this.response) != null ? ref1.statusCode : void 0;
      }
      this.name = "APIError";
      this.message = (ref2 = (ref3 = (ref4 = this.body) != null ? ref4.message : void 0) != null ? ref3 : this.body) != null ? ref2 : (ref5 = this.error) != null ? typeof ref5.toString === "function" ? ref5.toString() : void 0 : void 0;
    }

    APIError.prototype.notifyConsole = function() {
      return console.error("Edgehill API Error: " + this.message, this);
    };

    return APIError;

  })(Error);

  module.exports = {
    "APIError": APIError
  };

}).call(this);
