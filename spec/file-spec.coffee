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
    @file.id = 'fileId'
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

  describe "download", ->
    it "should do a GET request", ->
      spyOn(@connection, 'request').andCallFake -> Promise.resolve()
      @file.download()
      expect(@connection.request).toHaveBeenCalledWith({
        path: '/files/fileId/download',
        encoding: null,
        downloadRequest: true
      })


    describe "when the request succeeds", ->
      beforeEach ->
        spyOn(@connection, 'request').andCallFake ->
          response =
            headers:
              header1: '1'
              header2: '2'
            body: 'body'
            otherField: 'other'
          Promise.resolve(response)

      it "should resolve with the file information", ->
        testUntil (done) =>
          @file.download().then (file) ->
            fileInfo =
              body: 'body'
              header1: '1'
              header2: '2'
            expect(file).toEqual(fileInfo)
            done()

      it "should call the callback with the file object", ->
        testUntil (done) =>
          @file.download (err, file) ->
            fileInfo =
              body: 'body'
              header1: '1'
              header2: '2'
            expect(err).toBe(null)
            expect(file).toEqual(fileInfo)
            done()

    describe "when the request fails", ->
      beforeEach ->
        @error = new Error("Network error")
        spyOn(@connection, 'request').andCallFake =>
          Promise.reject(@error)

      it "should reject with the error", ->
        testUntil (done) =>
          @file.download().catch (err) =>
            expect(err).toBe(@error)
            done()

      it "should call the callback with the error", ->
        testUntil (done) =>
          @file.download (err, file) =>
            expect(err).toBe(@error)
            expect(file).toBe(undefined)
            done()

  describe "metadata", ->
    it "should do a GET request", ->
      spyOn(@connection, 'request').andCallFake -> Promise.resolve()
      @file.metadata()
      expect(@connection.request).toHaveBeenCalledWith({
        path: '/files/fileId',
      })


    describe "when the request succeeds", ->
      beforeEach ->
        spyOn(@connection, 'request').andCallFake ->
          response =
            content_type: "image/jpeg",
            filename: "sailing_photo.jpg",
            id: "dyla86usnzouam5wt7wt2bsvu",
            message_ids: ["cud32592sewzy834bzhsbu0kt"],
            account_id: "6aakaxzi4j5gn6f7kbb9e0fxs",
            object: "file",
            size: 8380
          Promise.resolve(response)

      it "should resolve with the file information", ->
        testUntil (done) =>
          @file.metadata().then (response) ->
            fileInfo =
              content_type: "image/jpeg",
              filename: "sailing_photo.jpg",
              id: "dyla86usnzouam5wt7wt2bsvu",
              message_ids: ["cud32592sewzy834bzhsbu0kt"],
              account_id: "6aakaxzi4j5gn6f7kbb9e0fxs",
              object: "file",
              size: 8380
            expect(response).toEqual(fileInfo)
            done()

      it "should call the callback with the file object", ->
        testUntil (done) =>
          @file.metadata (err, response) ->
            fileInfo =
              content_type: "image/jpeg",
              filename: "sailing_photo.jpg",
              id: "dyla86usnzouam5wt7wt2bsvu",
              message_ids: ["cud32592sewzy834bzhsbu0kt"],
              account_id: "6aakaxzi4j5gn6f7kbb9e0fxs",
              object: "file",
              size: 8380
            expect(err).toBe(null)
            expect(response).toEqual(fileInfo)
            done()

    describe "when the request fails", ->
      beforeEach ->
        @error = new Error("Network error")
        spyOn(@connection, 'request').andCallFake =>
          Promise.reject(@error)

      it "should reject with the error", ->
        testUntil (done) =>
          @file.metadata().catch (err) =>
            expect(err).toBe(@error)
            done()

      it "should call the callback with the error", ->
        testUntil (done) =>
          @file.metadata (err, file) =>
            expect(err).toBe(@error)
            expect(file).toBe(undefined)
            done()
