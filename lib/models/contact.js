(function() {
  var Attributes, Contact, RestfulModel, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RestfulModel = require('./restful-model');

  Attributes = require('./attributes');

  _ = require('underscore');

  module.exports = Contact = (function(superClass) {
    extend(Contact, superClass);

    function Contact() {
      return Contact.__super__.constructor.apply(this, arguments);
    }

    Contact.collectionName = 'contacts';

    Contact.attributes = _.extend({}, RestfulModel.attributes, {
      'name': Attributes.String({
        modelKey: 'name'
      }),
      'email': Attributes.String({
        modelKey: 'email'
      })
    });

    Contact.prototype.toJSON = function() {
      var json;
      json = Contact.__super__.toJSON.apply(this, arguments);
      json['name'] || (json['name'] = json['email']);
      return json;
    };

    return Contact;

  })(RestfulModel);

}).call(this);
