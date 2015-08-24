Nylas = require '../nylas'
NylasConnection = require '../nylas-connection'
Draft = require '../models/api_account'
Promise = require 'bluebird'
request = require 'request'
_ = require 'underscore'

describe "APIAccount", ->
  beforeEach ->
    @connection = new NylasConnection('123', hosted=false)
    Promise.onPossiblyUnhandledRejection (e, promise) ->

  describe "list", ->
    it "should do a GET request to get the account list", ->
      spyOn(@connection, 'request').andCallFake -> Promise.resolve([{
            "account_id": "1qqlrm3m82toh86nevz0o1l24",
            "email_address": "inboxapptest.french@gmail.com",
            "id": "1qqlrm3m82toh86nevz0o1l24",
            "name": "Inbox Apptest",
            "object": "account",
            "organization_unit": "label",
            "provider": "gmail"
        }])

      @connection.accounts.list {}, (err, accounts) ->
        expect(accounts.length).toEqual(1)
        expect(accounts[0].id).toEqual("1qqlrm3m82toh86nevz0o1l24")

      expect(@connection.request).toHaveBeenCalledWith({
        method : 'GET',
        qs : { limit: 100, offset: 0 }
        path : '/accounts'
      })
