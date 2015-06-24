(function() {
  var Delta, DeltaStream, EventEmitter, JSONStream, Promise, STREAMING_TIMEOUT_MS, querystring, request,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = require('events').EventEmitter;

  JSONStream = require('JSONStream');

  Promise = require('bluebird');

  querystring = require('querystring');

  request = require('request');

  STREAMING_TIMEOUT_MS = 2000;

  module.exports = Delta = (function() {
    function Delta(connection, namespaceId) {
      this.connection = connection;
      this.namespaceId = namespaceId;
      if (!(this.connection instanceof require('../nylas-connection'))) {
        throw new Error("Connection object not provided");
      }
      this;
    }

    Delta.prototype.generateCursor = function(timestampMs, callback) {
      var reqOpts;
      if (callback == null) {
        callback = null;
      }
      reqOpts = {
        method: 'POST',
        path: "/n/" + this.namespaceId + "/delta/generate_cursor",
        body: {
          start: Math.floor(timestampMs / 1000)
        }
      };
      return this.connection.request(reqOpts).then(function(response) {
        var cursor;
        cursor = response.cursor;
        if (callback) {
          callback(null, cursor);
        }
        return Promise.resolve(cursor);
      })["catch"](function(err) {
        if (callback) {
          callback(err);
        }
        return Promise.reject(err);
      });
    };

    Delta.prototype.startStream = function(cursor, excludeTypes) {
      var stream;
      if (excludeTypes == null) {
        excludeTypes = [];
      }
      stream = new DeltaStream(this.connection, this.namespaceId, cursor, excludeTypes);
      stream.open();
      return stream;
    };

    return Delta;

  })();


  /*
  A connection to the Nylas delta streaming API.
  
  Emits the following events:
  - `response` when the connection is established, with one argument, a `http.IncomingMessage`
  - `delta` for each delta received
  - `error` when an error occurs in the connection
   */

  DeltaStream = (function(superClass) {
    extend(DeltaStream, superClass);

    function DeltaStream(connection, namespaceId, cursor1, excludeTypes1) {
      this.connection = connection;
      this.namespaceId = namespaceId;
      this.cursor = cursor1;
      this.excludeTypes = excludeTypes1 != null ? excludeTypes1 : [];
      if (!(this.connection instanceof require('../nylas-connection'))) {
        throw new Error("Connection object not provided");
      }
      return this;
    }

    DeltaStream.prototype.close = function() {
      if (this.request) {
        this.request.abort();
      }
      return delete this.request;
    };

    DeltaStream.prototype.open = function() {
      var path, queryObj, queryStr, reqOpts;
      path = "/n/" + this.namespaceId + "/delta/streaming";
      queryObj = {
        cursor: this.cursor
      };
      if (this.excludeTypes) {
        queryObj.exclude_types = this.excludeTypes.join(',');
      }
      queryStr = querystring.stringify(queryObj);
      path += '?' + queryStr;
      reqOpts = this.connection.requestOptions({
        method: 'GET',
        path: path
      });
      return this.request = request(reqOpts).on('response', (function(_this) {
        return function(response) {
          var timeout;
          _this.emit('response', response);
          timeout = void 0;
          return response.on('data', function(data) {
            clearTimeout(timeout);
            return timeout = setTimeout(_this._restartConnection.bind(_this), STREAMING_TIMEOUT_MS);
          }).pipe(JSONStream.parse()).on('data', function(obj) {
            if (obj.cursor) {
              _this.cursor = obj.cursor;
            }
            return _this.emit('delta', obj);
          });
        };
      })(this)).on('error', function(err) {
        return this.emit('error', err);
      });
    };

    DeltaStream.prototype._restartConnection = function() {
      console.log('Restarting Nylas DeltaStream connection', this);
      this.close();
      return this.open();
    };

    return DeltaStream;

  })(EventEmitter);

}).call(this);
