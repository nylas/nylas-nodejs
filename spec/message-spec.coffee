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

describe "Message", ->
  beforeEach ->
    @connection = new NylasConnection('123')
    @message = new Message(@connection)
    @message.id = "4333"
    @message.starred = true
    @message.unread = false
    Promise.onPossiblyUnhandledRejection (e, promise) ->

  describe "save", ->
    it "should do a PUT request with labels if labels is defined. Additional arguments should be ignored.", ->
      label = new Label(@connection)
      label.id = 'label_id'
      @message.labels = [label]
      @message.randomArgument = true
      spyOn(@connection, 'request').andCallFake -> Promise.resolve()
      @message.save()
      expect(@connection.request).toHaveBeenCalledWith({
        method : 'PUT',
        body : {
          labels: ['label_id'],
          starred: true
          unread: false
        },
        qs : {}
        path : '/messages/4333'
      })

    it "should do a PUT with folder if folder is defined", ->
      label = new Label(@connection)
      label.id = 'label_id'
      @message.folder = label
      spyOn(@connection, 'request').andCallFake -> Promise.resolve()
      @message.save()
      expect(@connection.request).toHaveBeenCalledWith({
        method : 'PUT',
        body : {
          folder: 'label_id',
          starred: true
          unread: false
        },
        qs : {}
        path : '/messages/4333'
      })

  describe "sendRaw", ->
    it "should support sending with raw MIME", ->
      msg = "MIME-Version: 1.0
        Content-Type: text/plain; charset=UTF-8
        In-Reply-To: <84umizq7c4jtrew491brpa6iu-0@mailer.nylas.com>
        References: <84umizq7c4jtrew491brpa6iu-0@mailer.nylas.com>
        Subject: Meeting on Thursday
        From: Bill <wbrogers@mit.edu>
        To: Ben Bitdiddle <ben.bitdiddle@gmail.com>

        Hey Ben,

        Would you like to grab coffee @ 2pm this Thursday?"

      spyOn(@connection, 'request').andCallFake -> Promise.resolve({})
      Message.sendRaw(@connection, msg)
      expect(@connection.request).toHaveBeenCalledWith({
        headers:
          'Content-Type': 'message/rfc822'
        method: 'POST'
        path: '/send'
        body: msg
        json: false
      })
