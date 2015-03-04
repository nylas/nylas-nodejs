Nilas = require '../nilas'
NilasConnection = require '../nilas-connection'
RestfulModel = require '../models/restful-model'
Attributes = require '../models/attributes'
Promise = require 'bluebird'
request = require 'request'
_ = require 'underscore'

class RestfulSubclassA extends RestfulModel

class RestfulSubclassB extends RestfulModel

class RestfulSubclassAttributes extends RestfulModel
  @attributes: _.extend {}, RestfulModel.attributes,
    'testNumber': Attributes.Number
      modelKey: 'testNumber'
      jsonKey: 'test_number'
    'testBoolean': Attributes.Boolean
      modelKey: 'testBoolean'
      jsonKey: 'test_boolean'


describe "RestfulModel", ->
  beforeEach ->
    @connection = new NilasConnection('token')

  it "should throw an exception unless constructed with a connection", ->
    expect( => new RestfulModel()).toThrow()
    expect( => new RestfulModel(@connection)).not.toThrow()

  it "should accept a namespace id and other JSON properties", ->
    model = new RestfulModel(@connection, 'namespace-id', {object: 'thread', id: '123'})
    expect(model.namespaceId).toBe('namespace-id')
    expect(model.object).toBe('thread')
    expect(model.id).toBe('123')

  describe "attributes", ->
    it "should return the attributes attached to the class", ->
      model = new RestfulModel(@connection, 'namespace-id', {object: 'thread', id: '123'})
      expect(model.attributes()).toBe(model.constructor.attributes)

  describe "isEqual", ->
    beforeEach ->
      @model1 = new RestfulModel(@connection, 'namespace-id', {object: 'thread', id: 'A'})
      @model2 = new RestfulModel(@connection, 'namespace-id', {object: 'thread', id: 'A'})
      @model3 = new RestfulModel(@connection, 'namespace-id', {object: 'thread', id: 'B'})
      @model4 = new RestfulSubclassA(@connection, 'namespace-id', {object: 'thread', id: 'B'})
      @model5 = new RestfulSubclassB(@connection, 'namespace-id', {object: 'thread', id: 'C'})
      @model6 = new RestfulSubclassB(@connection, 'namespace-id', {object: 'thread', id: 'C'})

    it "should return true if the objects are of the same class and have the same id", ->
      expect(@model1.isEqual(@model2)).toBe(true)
      expect(@model5.isEqual(@model6)).toBe(true)

    it "should return false otherwise", ->
      expect(@model1.isEqual(@model3)).toBe(false)
      expect(@model3.isEqual(@model4)).toBe(false)

  describe "fromJSON", ->
    beforeEach ->
      @json =
        'id': '1234'
        'namespace_id': '1234'
        'test_number': 4
        'test_boolean': true
        'daysOld': 4
      @m = new RestfulSubclassAttributes(@connection, 'namespace-id')

    it "should assign attribute values by calling through to attribute fromJSON functions", ->
      spyOn(RestfulSubclassAttributes.attributes.namespaceId, 'fromJSON').andCallFake (json) ->
        'inflated value!'
      @m.fromJSON(@json)
      expect(RestfulSubclassAttributes.attributes.namespaceId.fromJSON.callCount).toBe(1)
      expect(@m.namespaceId).toBe('inflated value!')

    it "should not touch attributes that are missing in the json", ->
      @m.fromJSON(@json)
      expect(@m.object).toBe(undefined)

      @m.object = 'abc'
      @m.fromJSON(@json)
      expect(@m.object).toBe('abc')

    it "should not do anything with extra JSON keys", ->
      @m.fromJSON(@json)
      expect(@m.daysOld).toBe(undefined)

    describe "Attributes.Number", ->
      it "should read number attributes and coerce them to numeric values", ->
        @m.fromJSON('test_number': 4)
        expect(@m.testNumber).toBe(4)

        @m.fromJSON('test_number': '4')
        expect(@m.testNumber).toBe(4)

        @m.fromJSON('test_number': 'lolz')
        expect(@m.testNumber).toBe(null)

        @m.fromJSON('test_number': 0)
        expect(@m.testNumber).toBe(0)


    describe "Attributes.Boolean", ->
      it "should read `true` or true and coerce everything else to false", ->
        @m.fromJSON('test_boolean': true)
        expect(@m.testBoolean).toBe(true)

        @m.fromJSON('test_boolean': 'true')
        expect(@m.testBoolean).toBe(true)

        @m.fromJSON('test_boolean': 4)
        expect(@m.testBoolean).toBe(false)

        @m.fromJSON('test_boolean': '4')
        expect(@m.testBoolean).toBe(false)

        @m.fromJSON('test_boolean': false)
        expect(@m.testBoolean).toBe(false)

        @m.fromJSON('test_boolean': 0)
        expect(@m.testBoolean).toBe(false)

        @m.fromJSON('test_boolean': null)
        expect(@m.testBoolean).toBe(false)

  describe "toJSON", ->
    beforeEach ->
      @model = new RestfulModel(@connection, 'ACD', {
        id: "1234",
        namespace_id: "ACD"
      })

    it "should return a JSON object and call attribute toJSON functions to map values", ->
      spyOn(RestfulModel.attributes.namespaceId, 'toJSON').andCallFake (json) ->
        'inflated value!'

      json = @model.toJSON()
      expect(json instanceof Object).toBe(true)
      expect(json.id).toBe('1234')
      expect(json.namespace_id).toBe('inflated value!')

    it "should surface any exception one of the attribute toJSON functions raises", ->
      spyOn(RestfulModel.attributes.namespaceId, 'toJSON').andCallFake (json) ->
        throw new Error("Can't convert value into JSON format")
      expect(-> @model.toJSON()).toThrow()
