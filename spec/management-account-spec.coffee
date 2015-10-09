Nylas = require '../nylas'
NylasConnection = require '../nylas-connection'
Promise = require 'bluebird'
request = require 'request'
_ = require 'underscore'

describe "ManagementAccount", ->
  beforeEach ->
    Promise.onPossiblyUnhandledRejection (e, promise) ->

  describe "list", ->
    it "should do a GET request to get the account list", ->
      Nylas.config
        appId: 'abc'
        appSecret: 'xyz'

      spyOn(Nylas.accounts.connection, 'request').andCallFake -> Promise.resolve([{
        "account_id": "8rilmlwuo4zmpjedz8bcplclk",
        "billing_state": "free",
        "id": "8rilmlwuo4zmpjedz8bcplclk",
        "namespace_id": "2lrhtr5xxrqv3hrcre54tugru",
        "sync_state": "running",
        "trial": false
      }])

      Nylas.accounts.list {}, (err, account) ->
        expect(accounts.length).toEqual(1)
        expect(accounts[0].id).toEqual("8rilmlwuo4zmpjedz8bcplclk")

      expect(Nylas.accounts.connection.request).toHaveBeenCalledWith({
        method : 'GET',
        qs : { limit: 100, offset: 0 }
        path : '/a/abc/accounts'
      })
