(function() {
  var Delta, DeltaStream, EventEmitter, JSONStream, Promise, _, backoff, request,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore');

  backoff = require('backoff');

  EventEmitter = require('events').EventEmitter;

  JSONStream = require('JSONStream');

  Promise = require('bluebird');

  request = require('request');

  module.exports = Delta = (function() {
    Delta.streamingTimeoutMs = 15000;

    function Delta(connection) {
      this.connection = connection;
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
        path: "/delta/generate_cursor",
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

    Delta.prototype.latestCursor = function(callback) {
      var reqOpts;
      reqOpts = {
        method: 'POST',
        path: "/delta/latest_cursor"
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

    Delta.prototype.startStream = function(cursor, params) {
      if (params == null) {
        params = {};
      }
      return this._startStream(request, cursor, params);
    };

    Delta.prototype._startStream = function(createRequest, cursor, params) {
      var stream;
      if (params == null) {
        params = {};
      }
      stream = new DeltaStream(createRequest, this.connection, cursor, params);
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

    DeltaStream.MAX_RESTART_RETRIES = 5;

    function DeltaStream(createRequest1, connection, cursor1, params1) {
      this.createRequest = createRequest1;
      this.connection = connection;
      this.cursor = cursor1;
      this.params = params1 != null ? params1 : {};
      if (!(this.connection instanceof require('../nylas-connection'))) {
        throw new Error("Connection object not provided");
      }
      this.restartBackoff = backoff.exponential({
        randomisationFactor: 0.5,
        initialDelay: 250,
        maxDelay: 30000,
        factor: 4
      });
      this.restartBackoff.failAfter(DeltaStream.MAX_RESTART_RETRIES);
      this.restartBackoff.on('backoff', this._restartConnection.bind(this)).on('fail', (function(_this) {
        return function() {
          return _this.emit('error', "Nylas DeltaStream failed to reconnect after " + DeltaStream.MAX_RESTART_RETRIES + " retries.");
        };
      })(this));
      return this;
    }

    DeltaStream.prototype.close = function() {
      clearTimeout(this.timeoutId);
      delete this.timeoutId;
      this.restartBackoff.reset();
      if (this.request) {
        this.request.abort();
      }
      return delete this.request;
    };

    DeltaStream.prototype.open = function() {
      var excludeTypes, includeTypes, path, queryObj, ref, ref1, reqOpts;
      this.close();
      path = "/delta/streaming";
      excludeTypes = (ref = this.params.excludeTypes) != null ? ref : [];
      includeTypes = (ref1 = this.params.includeTypes) != null ? ref1 : [];
      queryObj = _.extend({}, _.omit(this.params, 'excludeTypes', 'includeTypes'), {
        cursor: this.cursor
      });
      if (excludeTypes.length > 0) {
        queryObj.exclude_types = excludeTypes.join(',');
      }
      if (includeTypes.length > 0) {
        queryObj.include_types = includeTypes.join(',');
      }
      reqOpts = this.connection.requestOptions({
        method: 'GET',
        path: path,
        qs: queryObj
      });
      return this.request = this.createRequest(reqOpts).on('response', (function(_this) {
        return function(response) {
          if (response.statusCode !== 200) {
            response.on('data', function(data) {
              var e, err;
              err = data;
              try {
                err = JSON.parse(err);
              } catch (_error) {
                e = _error;
              }
              return _this._onError(err);
            });
            return;
          }
          _this.emit('response', response);
          _this._onDataReceived();
          return response.on('data', _this._onDataReceived.bind(_this)).pipe(JSONStream.parse()).on('data', function(obj) {
            if (obj.cursor) {
              _this.cursor = obj.cursor;
            }
            return _this.emit('delta', obj);
          });
        };
      })(this)).on('error', this._onError.bind(this));
    };

    DeltaStream.prototype._onDataReceived = function(data) {
      clearTimeout(this.timeoutId);
      this.restartBackoff.reset();
      return this.timeoutId = setTimeout(this.restartBackoff.backoff.bind(this.restartBackoff), Delta.streamingTimeoutMs);
    };

    DeltaStream.prototype._onError = function(err) {
      console.error('Nylas DeltaStream error:', err);
      this.restartBackoff.reset();
      return this.emit('error', err);
    };

    DeltaStream.prototype._restartConnection = function(n) {
      var ref;
      console.log("Restarting Nylas DeltaStream connection (attempt " + (n + 1) + "):", (ref = this.request) != null ? ref.href : void 0);
      this.close();
      return this.open();
    };

    return DeltaStream;

  })(EventEmitter);

}).call(this);
