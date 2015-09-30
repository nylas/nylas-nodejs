Nylas = require '../nylas'
NylasConnection = require '../nylas-connection'
File = require '../models/file'
Promise = require 'bluebird'
request = require 'request'
_ = require 'underscore'

testUntil = (fn) ->
  finished = false
  runs ->
    fn (callback) ->
      finished = true
  waitsFor -> finished

describe "File", ->
  beforeEach ->
    @connection = new NylasConnection('123')
    @file = new File(@connection)
    @file.data = 'Sample data'
    @file.contentType = 'text/plain'
    @file.filename = 'sample.txt'
    Promise.onPossiblyUnhandledRejection (e, promise) ->

  describe "upload", ->
    it "should do a POST request", ->
      spyOn(@connection, 'request').andCallFake -> Promise.resolve()
      @file.upload()
      expect(@connection.request).toHaveBeenCalledWith({
        method: 'POST',
        json: false,
        path: '/files',
        formData:
          file:
            value: 'Sample data',
            options:
              filename: 'sample.txt',
              contentType: 'text/plain'
      })


    describe "when the request succeeds", ->
      beforeEach ->
        spyOn(@connection, 'request').andCallFake ->
          fileJSON = [{
            id: 'id-1234'
            filename: 'sample.txt'
          }]
          Promise.resolve(fileJSON)

      it "should resolve with the file object", ->
        testUntil (done) =>
          @file.upload().then (file) ->
            expect(file.id).toBe('id-1234')
            expect(file.filename).toBe('sample.txt')
            done()

      it "should call the callback with the file object", ->
        testUntil (done) =>
          @file.upload (err, file) ->
            expect(err).toBe(null)
            expect(file.id).toBe('id-1234')
            expect(file.filename).toBe('sample.txt')
            done()

    describe "when the request fails", ->
      beforeEach ->
        @error = new Error("Network error")
        spyOn(@connection, 'request').andCallFake =>
          Promise.reject(@error)

      it "should reject with the error", ->
        testUntil (done) =>
          @file.upload().catch (err) =>
            expect(err).toBe(@error)
            done()

      it "should call the callback with the error", ->
        testUntil (done) =>
          @file.upload (err, file) =>
            expect(err).toBe(@error)
            expect(file).toBe(undefined)
            done()
