Nylas = require '../nylas'
NylasConnection = require '../nylas-connection'
Draft = require '../models/draft'
Promise = require 'bluebird'
request = require 'request'
_ = require 'underscore'

testUntil = (fn) ->
  finished = false
  runs ->
    fn (callback) ->
      finished = true
  waitsFor -> finished

describe "Draft", ->
  beforeEach ->
    @connection = new NylasConnection('123')
    @draft = new Draft(@connection)
    Promise.onPossiblyUnhandledRejection (e, promise) ->

  describe "save", ->
    it "should do a POST request if the draft has no id", ->
      @draft.id = undefined
      spyOn(@connection, 'request').andCallFake -> Promise.resolve()
      @draft.save()
      expect(@connection.request).toHaveBeenCalledWith({
        method : 'POST',
        body : {
          id : undefined,
          object : 'draft',
          account_id : undefined,
          to : [  ],
          cc : [  ],
          bcc : [  ],
          from : [  ],
          date : null,
          body : '',
          files : [  ],
          unread : undefined,
          snippet : undefined,
          thread_id : undefined,
          subject : '',
          draft : undefined,
          version : undefined,
          folder : undefined,
          labels: [ ],
          file_ids : [  ]
        },
        qs : { }
        path : '/drafts'
      })

    it "should do a PUT request if the draft has an id", ->
      @draft.id = 'id-1234'
      spyOn(@connection, 'request').andCallFake -> Promise.resolve()
      @draft.save()
      expect(@connection.request).toHaveBeenCalledWith({
        method : 'PUT',
        body : {
          id : 'id-1234',
          object : 'draft',
          account_id : undefined,
          to : [  ],
          cc : [  ],
          bcc : [  ],
          from : [  ],
          date : null,
          body : '',
          files : [  ],
          unread : undefined,
          snippet : undefined,
          thread_id : undefined,
          subject : '',
          draft : undefined,
          version : undefined,
          folder : undefined,
          labels: [ ],
          file_ids : [  ]
        },
        qs : { }
        path : '/drafts/id-1234'
      })

    describe "when the request succeeds", ->
      beforeEach ->
        spyOn(@connection, 'request').andCallFake ->
          draftJSON = {
            id: 'id-1234'
            version: 1
          }
          Promise.resolve(draftJSON)

      it "should resolve with the draft object", ->
        testUntil (done) =>
          @draft.save().then (draft) ->
            expect(draft.id).toBe('id-1234')
            expect(draft.version).toBe(1)
            done()

      it "should call the callback with the draft object", ->
        testUntil (done) =>
          @draft.save (err, draft) ->
            expect(err).toBe(null)
            expect(draft.id).toBe('id-1234')
            expect(draft.version).toBe(1)
            done()

    describe "when the request fails", ->
      beforeEach ->
        @error = new Error("Network error")
        spyOn(@connection, 'request').andCallFake =>
          Promise.reject(@error)

      it "should reject with the error", ->
        testUntil (done) =>
          @draft.save().catch (err) =>
            expect(err).toBe(@error)
            done()

      it "should call the callback with the error", ->
        testUntil (done) =>
          @draft.save (err, draft) =>
            expect(err).toBe(@error)
            expect(draft).toBe(undefined)
            done()


  describe "send", ->
    it "should send the draft_id and version if the draft has an id", ->
      @draft.id = 'id-1234'
      @draft.version = 2
      spyOn(@connection, 'request').andCallFake -> Promise.resolve()
      @draft.send()
      expect(@connection.request).toHaveBeenCalledWith({
        method : 'POST',
        body : {
          draft_id : 'id-1234',
          version : 2
        },
        path : '/send'
      })

    it "should send the draft JSON if the draft has no id", ->
      @draft.id = undefined
      @draft.subject = 'Test Subject'
      spyOn(@connection, 'request').andCallFake -> Promise.resolve()
      @draft.send()
      expect(@connection.request).toHaveBeenCalledWith({
        method : 'POST',
        body : {
          id : undefined,
          object : 'draft',
          account_id : undefined,
          to : [  ],
          cc : [  ],
          bcc : [  ],
          from : [  ],
          date : null,
          body : '',
          files : [  ],
          unread : undefined,
          snippet : undefined,
          thread_id : undefined,
          subject : 'Test Subject',
          draft : undefined,
          version : undefined,
          folder : undefined,
          labels: [ ],
          file_ids : [  ]
        },
        path : '/send'
      })

    describe "when the request succeeds", ->
      beforeEach ->
        spyOn(@connection, 'request').andCallFake ->
          draftJSON = {
            id: 'id-1234'
            thread_id: 'new-thread-id'
          }
          Promise.resolve(draftJSON)

      it "should resolve with the draft object", ->
        testUntil (done) =>
          @draft.save().then (draft) ->
            expect(draft.id).toBe('id-1234')
            expect(draft.threadId).toBe('new-thread-id')
            done()

      it "should call the callback with the draft object", ->
        testUntil (done) =>
          @draft.save (err, draft) ->
            expect(err).toBe(null)
            expect(draft.id).toBe('id-1234')
            expect(draft.threadId).toBe('new-thread-id')
            done()

    describe "when the request fails", ->
      beforeEach ->
        @error = new Error("Network error")
        spyOn(@connection, 'request').andCallFake =>
          Promise.reject(@error)

      it "should reject with the error", ->
        testUntil (done) =>
          @draft.save().catch (err) =>
            expect(err).toBe(@error)
            done()

      it "should call the callback with the error", ->
        testUntil (done) =>
          @draft.save (err, draft) =>
            expect(err).toBe(@error)
            expect(draft).toBe(undefined)
            done()

