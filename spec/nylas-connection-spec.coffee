NylasConnection = require '../nylas-connection'
Promise = require 'bluebird'

describe "NylasConnection", ->
  describe "send", ->
    beforeEach ->
      @connection = new NylasConnection('123')


    it "should support sending directly", ->
      message =
        id: "4333"
        reply_to_message_id: "84umizq7c4jtrew491brpa6iu"
        body: "Sounds great! See you then."
        to:
          name: "Bill"
          email: "wbrogers@mit.edu"
        reply_to: []
        cc: []
        bcc: []
        files: []
        subject: "Let's test"

      spyOn(@connection, 'request').andCallFake -> Promise.resolve({})
      @connection.send(message)
      expect(@connection.request).toHaveBeenCalledWith
        method: 'POST'
        body:
          id: "4333"
          reply_to_message_id: "84umizq7c4jtrew491brpa6iu"
          body: "Sounds great! See you then."
          to:
            name: "Bill"
            email: "wbrogers@mit.edu"
          reply_to: []
          cc: []
          bcc: []
          files: []
          subject: "Let's test"
        path: '/send'

    it "should support sending with raw MIME", ->
      message = "MIME-Version: 1.0
        Content-Type: text/plain; charset=UTF-8
        In-Reply-To: <84umizq7c4jtrew491brpa6iu-0@mailer.nylas.com>
        References: <84umizq7c4jtrew491brpa6iu-0@mailer.nylas.com>
        Subject: Meeting on Thursday
        From: Bill <wbrogers@mit.edu>
        To: Ben Bitdiddle <ben.bitdiddle@gmail.com>

        Hey Ben,

        Would you like to grab coffee @ 2pm this Thursday?"

      spyOn(@connection, 'request').andCallFake -> Promise.resolve({})
      @connection.send(message)
      expect(@connection.request).toHaveBeenCalledWith
        headers:
          'Content-Type': 'message/rfc822'
        method: 'POST'
        path: '/send'
        body: message
