Nylas = require '../nylas'
NylasConnection = require '../nylas-connection'
Account = require '../models/account'
Promise = require 'bluebird'

describe "account", ->
  beforeEach ->
    @connection = new NylasConnection('123')

  it 'should fetch an account model', ->
    result = {
      "account_id": "hecea680y4sborshkiraj17c",
      "email_address": "jeremy@emmerge.com",
      "id": "hecea680y4sborshkiraj17c",
      "name": "",
      "object": "account",
      "organization_unit": "folder",
      "provider": "eas",
      "sync_state": "running"
    }
    spyOn(@connection, 'request').andCallFake -> Promise.resolve(result)

    @connection.account.get()
    expect(@connection.request).toHaveBeenCalledWith({
      method : 'GET',
      path : '/account'
      qs: {}
    })
