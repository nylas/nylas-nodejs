Nylas = require '../nylas'
NylasConnection = require '../nylas-connection'
Thread = require '../models/thread'
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

describe "Thread", ->
  beforeEach ->
    @connection = new NylasConnection('123')
    @thread = new Thread(@connection, 'test-namespace-id')
    @thread.id = "4333"
    @thread.starred = true
    @thread.unread = false
    Promise.onPossiblyUnhandledRejection (e, promise) ->

  describe "save", ->
    it "should do a PUT request with labels if labels is defined", ->
      label = new Label(@connection, 'test-namespace-id')
      label.id = 'label_id'
      @thread.labels = [label]
      spyOn(@connection, 'request').andCallFake -> Promise.resolve()
      @thread.save()
      expect(@connection.request).toHaveBeenCalledWith({
        method : 'PUT',
        body : {
          labels: ['label_id'],
          starred: true
          unread: false
        },
        qs : {}
        path : '/threads/4333'
      })

    it "should do a PUT with folder if folder is defined", ->
      label = new Label(@connection, 'test-namespace-id')
      label.id = 'label_id'
      @thread.folder = label
      spyOn(@connection, 'request').andCallFake -> Promise.resolve()
      @thread.save()
      expect(@connection.request).toHaveBeenCalledWith({
        method : 'PUT',
        body : {
          folder: 'label_id',
          starred: true
          unread: false
        },
        qs : {}
        path : '/threads/4333'
      })
