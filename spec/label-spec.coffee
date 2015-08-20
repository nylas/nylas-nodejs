Nylas = require '../nylas'
NylasConnection = require '../nylas-connection'
Message = require '../models/message'
Label = require('../models/folder').Label
Promise = require 'bluebird'
request = require 'request'
_ = require 'underscore'

testUntil = (fn) ->
  finished = false
  runs ->
    fn (callback) ->
      finished = true
  waitsFor -> finished

describe "Label", ->
  beforeEach ->
    @connection = new NylasConnection('123')
    @label = new Label(@connection)
    @label.displayName = 'Label name'
    @label.name = 'Longer label name'
    Promise.onPossiblyUnhandledRejection (e, promise) ->

  describe "save", ->
    it "should do a POST request if id is undefined", ->
      spyOn(@connection, 'request').andCallFake -> Promise.resolve()
      @label.save()
      expect(@connection.request).toHaveBeenCalledWith({
        method : 'POST',
        body : {
          display_name: 'Label name'
          name: 'Longer label name'
        },
        qs : {}
        path : '/labels'
      })

    it "should do a PUT if id is defined", ->
      @label.id = 'label_id'
      spyOn(@connection, 'request').andCallFake -> Promise.resolve()
      @label.save()
      expect(@connection.request).toHaveBeenCalledWith({
        method : 'PUT',
        body : {
          display_name: 'Label name'
          name: 'Longer label name'
        },
        qs : {}
        path : '/labels/label_id'
      })
