(function() {
  var Attributes, Participant, RestfulModel, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RestfulModel = require('./restful-model');

  Attributes = require('./attributes');

  _ = require('underscore');

  module.exports = Participant = (function(superClass) {
    extend(Participant, superClass);

    function Participant() {
      return Participant.__super__.constructor.apply(this, arguments);
    }

    Participant.collectionName = 'participants';

    Participant.attributes = {
      'name': Attributes.String({
        modelKey: 'name'
      }),
      'email': Attributes.String({
        modelKey: 'email'
      }),
      'status': Attributes.String({
        modelKey: 'status'
      })
    };

    Participant.prototype.toJSON = function() {
      var json;
      json = Participant.__super__.toJSON.apply(this, arguments);
      json['name'] || (json['name'] = json['email']);
      delete json['object'];
      return json;
    };

    return Participant;

  })(RestfulModel);

}).call(this);
