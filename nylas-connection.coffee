_ = require 'underscore'
request = require 'request'
Promise = require 'bluebird'

module.exports =
class NylasConnection

  constructor: (@accessToken) ->
    Namespace = require './models/namespace'
    RestfulModelCollection = require './models/restful-model-collection'

    Account = require './models/account'
    ManagementModelCollection = require './models/management-model-collection'

    @namespaces = new RestfulModelCollection(Namespace, @, null)
    @accounts = new ManagementModelCollection(Account, @, null)

  request: (options={}) ->
    Nylas = require './nylas'
    options.method ?= 'GET'
    options.url ?= "#{Nylas.apiServer}#{options.path}" if options.path
    options.body ?= {} unless options.formData
    options.json ?= true

    if @accessToken
      options.auth =
        'user': @accessToken,
        'pass': '',
        'sendImmediately': true

    new Promise (resolve, reject) ->
      request options, (error, response, body) ->
        if error or response.statusCode > 299
          error ?= new Error(body.message)
          reject(error)
        else
          try
            body = JSON.parse(body) if _.isString body
            resolve(body)
          catch error
            reject(error)
