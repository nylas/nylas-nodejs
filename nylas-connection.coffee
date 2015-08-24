_ = require 'underscore'
clone = require 'clone'
request = require 'request'
Promise = require 'bluebird'
RestfulModel = require './models/restful-model'
RestfulModelCollection = require './models/restful-model-collection'
Account = require './models/account'
APIAccount = require './models/api_account'
ManagementModelCollection = require './models/management-model-collection'
Thread = require './models/thread'
Contact = require './models/contact'
Message = require './models/message'
Draft = require './models/draft'
File = require './models/file'
Calendar = require './models/calendar'
Event = require './models/event'
Tag = require './models/tag'
Delta = require './models/delta'
Label = require('./models/folder').Label
Folder = require('./models/folder').Folder

Attributes = require './models/attributes'


module.exports =
class NylasConnection

  constructor: (@accessToken, hosted = true) ->
    @threads = new RestfulModelCollection(Thread, @)
    @contacts = new RestfulModelCollection(Contact, @)
    @messages = new RestfulModelCollection(Message, @)
    @drafts = new RestfulModelCollection(Draft, @)
    @files = new RestfulModelCollection(File, @)
    @calendars = new RestfulModelCollection(Calendar, @)
    @events = new RestfulModelCollection(Event, @)
    @tags = new RestfulModelCollection(Tag, @)
    @deltas = new Delta(@)
    @labels = new RestfulModelCollection(Label, @)
    @folders = new RestfulModelCollection(Folder, @)
    @usingHostedAPI = hosted

    if @usingHostedAPI
        @accounts = new ManagementModelCollection(Account, @, null)
    else
        @accounts = new RestfulModelCollection(APIAccount, @)

  usingHostedAPI: ->
    return

  requestOptions: (options={}) ->
    options = clone(options)
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
    return options

  request: (options={}) ->
    options = @requestOptions(options)

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
