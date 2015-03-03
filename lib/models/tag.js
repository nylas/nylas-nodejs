(function() {
  var Attributes, RestfulModel, Tag, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RestfulModel = require('./restful-model');

  Attributes = require('./attributes');

  _ = require('underscore');

  module.exports = Tag = (function(superClass) {
    extend(Tag, superClass);

    function Tag() {
      return Tag.__super__.constructor.apply(this, arguments);
    }

    Tag.collectionName = 'tags';

    Tag.attributes = _.extend({}, RestfulModel.attributes, {
      'name': Attributes.String({
        modelKey: 'name'
      })
    });

    return Tag;

  })(RestfulModel);

}).call(this);
