# The Attribute class represents a single model attribute, like 'namespace_id'
# Subclasses of Attribute like AttributeDateTime know how to covert between
# the JSON representation of that type and the javascript representation.
# The Attribute class also exposes convenience methods for generating Matchers.
class Attribute
  constructor: ({modelKey, queryable, jsonKey}) ->
    @modelKey = modelKey
    @jsonKey = jsonKey || modelKey
    @queryable = queryable
    @

  toJSON: (val) -> val
  fromJSON: (val, parent) -> val || null

class AttributeNumber extends Attribute
  toJSON: (val) -> val
  fromJSON: (val, parent) -> unless isNaN(val) then Number(val) else null

class AttributeBoolean extends Attribute
  toJSON: (val) -> val
  fromJSON: (val, parent) -> (val is 'true' or val is true) || false

class AttributeString extends Attribute
  toJSON: (val) -> val
  fromJSON: (val, parent) -> val || ""

class AttributeStringList extends Attribute
  toJSON: (val) -> val
  fromJSON: (val, parent) -> val || []

class AttributeDateTime extends Attribute
  toJSON: (val) ->
    return null unless val
    unless val instanceof Date
      throw new Error "Attempting to toJSON AttributeDateTime which is not a date: #{@modelKey} = #{val}"
    val.getTime() / 1000.0

  fromJSON: (val, parent) ->
    return null unless val
    new Date(val*1000)

class AttributeCollection extends Attribute
  constructor: ({modelKey, jsonKey, itemClass}) ->
    super
    @itemClass = itemClass
    @

  toJSON: (vals) ->
    return [] unless vals
    json = []
    for val in vals
      if val.toJSON?
        json.push(val.toJSON())
      else
        json.push(val)
    json

  fromJSON: (json, parent) ->
    return [] unless json && json instanceof Array
    objs = []
    for objJSON in json
      obj = new @itemClass(parent.connection, objJSON)
      objs.push(obj)
    objs

module.exports = {
  Number: -> new AttributeNumber(arguments...)
  String: -> new AttributeString(arguments...)
  StringList: -> new AttributeStringList(arguments...)
  DateTime: -> new AttributeDateTime(arguments...)
  Collection: -> new AttributeCollection(arguments...)
  Boolean: -> new AttributeBoolean(arguments...)
  Object: -> new Attribute(arguments...)

  AttributeNumber: AttributeNumber
  AttributeString: AttributeString
  AttributeStringList: AttributeStringList
  AttributeDateTime: AttributeDateTime
  AttributeCollection: AttributeCollection
  AttributeBoolean: AttributeBoolean
}
