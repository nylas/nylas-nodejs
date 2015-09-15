_ = require 'underscore'
request = require 'request'
Promise = require 'bluebird'
NylasConnection = require './nylas-connection'

class Nylas
  @appId: null
  @appSecret: null
  @apiServer: 'https://api.nylas.com'

  @config: ({appId, appSecret, apiServer} = {}) ->
    throw new Error("Please specify a fully qualified URL for the API Server.") if apiServer?.indexOf('://') == -1

    @appId = appId if appId
    @appSecret = appSecret if appSecret
    @apiServer = apiServer if apiServer
    @

  @hostedAPI: ->
    @appId? and @appSecret?

  @with: (accessToken) ->
    throw new Error("This function requires an access token") unless accessToken?
    new NylasConnection(accessToken, hosted = @hostedAPI)

  @exchangeCodeForToken: (code, callback) ->
    throw new Error("exchangeCodeForToken() cannot be called until you provide an appId and secret via config()") unless @appId and @appSecret
    throw new Error("exchangeCodeForToken() must be called with a code") unless code?

    new Promise (resolve, reject) =>
      options =
        method: 'GET'
        json: true
        url: "#{@apiServer}/oauth/token"
        qs:
          'client_id': @appId
          'client_secret': @appSecret
          'grant_type': 'authorization_code'
          'code': code

      request options, (error, response, body) ->
        if error
          reject(error)
          callback(error) if callback
        else
          resolve(body['access_token'])
          callback(null, body['access_token']) if callback

  @urlForAuthentication: (options = {}) ->
    throw new Error("urlForAuthentication() cannot be called until you provide an appId and secret via config()") unless @appId and @appSecret
    throw new Error("urlForAuthentication() requires options.redirectURI") unless options.redirectURI?
    options.loginHint ?= ''
    options.trial ?= false
    "#{@apiServer}/oauth/authorize?client_id=#{@appId}&trial=#{options.trial}&response_type=code&scope=email&login_hint=#{options.loginHint}&redirect_uri=#{options.redirectURI}"

module.exports = Nylas
