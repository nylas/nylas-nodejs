Nylas = require '../nylas'
NylasConnection = require '../nylas-connection'
Thread = require '../models/thread'
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

describe "Thread", ->
  beforeEach ->
    @connection = new NylasConnection('123')
    @thread = new Thread(@connection)
    @thread.id = "4333"
    @thread.starred = true
    @thread.unread = false
    Promise.onPossiblyUnhandledRejection (e, promise) ->

  describe "save", ->
    it "should do a PUT request with labels if labels is defined", ->
      label = new Label(@connection)
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
      label = new Label(@connection)
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

  describe "fromJSON", ->
    it "should populate messages and draft fields when receiving expanded thread", ->
      m1 = {id: 'm1', object: 'message', to: [{name: 'Ben Bitdiddle', email: 'ben.bitdiddle@gmail.com'}]}
      m2 = {id: 'm2', object: 'message', to: [{name: 'Alice', email: 'alice@gmail.com'}]}
      draft = {id: 'm3', object: 'draft', to: [{name: 'Bob', email: 'bob@gmail.com'}]}

      t = @thread.fromJSON({messages: [m1, m2], drafts: [draft]})
      expect(t.messages).toBeDefined()
      expect(t.messages[0] instanceof Message).toBe(true)
      expect(t.messages[0].id).toBe('m1')
      expect(t.messages[1] instanceof Message).toBe(true)
      expect(t.messages[1].id).toBe('m2')
      expect(t.drafts[0] instanceof Message).toBe(true)
      expect(t.drafts[0].id).toBe('m3')
      expect(t.drafts[0].draft).toBe(true)
