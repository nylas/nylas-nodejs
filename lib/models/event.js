(function() {
  var Attributes, Event, RestfulModel, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RestfulModel = require('./restful-model');

  Attributes = require('./attributes');

  _ = require('underscore');

  module.exports = Event = (function(superClass) {
    extend(Event, superClass);

    function Event() {
      return Event.__super__.constructor.apply(this, arguments);
    }

    Event.collectionName = 'events';

    Event.attributes = _.extend({}, RestfulModel.attributes, {
      'title': Attributes.String({
        modelKey: 'title'
      }),
      'description': Attributes.String({
        modelKey: 'description'
      }),
      'location': Attributes.String({
        modelKey: 'location'
      }),
      'when': Attributes.Object({
        modelKey: 'when'
      }),
      'start': Attributes.Number({
        modelKey: 'start',
        jsonKey: '_start'
      }),
      'end': Attributes.Number({
        modelKey: 'end',
        jsonKey: '_end'
      })
    });

    Event.prototype.fromJSON = function(json) {
      Event.__super__.fromJSON.call(this, json);
      this.start = this.when.start_time || new Date(this.when.start_date).getTime() / 1000.0 || this.when.time;
      this.end = this.when.end_time || new Date(this.when.end_date).getTime() / 1000.0 + (60 * 60 * 24 - 1) || this.when.time;
      delete this.when.object;
      return this;
    };

    return Event;

  })(RestfulModel);

}).call(this);
