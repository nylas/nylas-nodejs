(function() {
  var Attributes, Calendar, RestfulModel, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RestfulModel = require('./restful-model');

  Attributes = require('./attributes');

  _ = require('underscore');

  module.exports = Calendar = (function(superClass) {
    extend(Calendar, superClass);

    function Calendar() {
      return Calendar.__super__.constructor.apply(this, arguments);
    }

    Calendar.collectionName = 'calendars';

    Calendar.attributes = _.extend({}, RestfulModel.attributes, {
      'name': Attributes.String({
        modelKey: 'name'
      }),
      'description': Attributes.String({
        modelKey: 'description'
      }),
      'readOnly': Attributes.Boolean({
        modelKey: 'readOnly',
        jsonKey: 'read_only'
      })
    });

    return Calendar;

  })(RestfulModel);

}).call(this);
