_ = require 'underscore'
request = require 'request'
Promise = require 'bluebird'
NilasConnection = require './nilas-connection'

class Nilas
  @appId: null
  @appSecret: null
  @apiServer: 'https://api.nilas.com'
  @authServer: 'https://www.nilas.com'

  @config: ({appId, appSecret, apiServer, authServer} = {}) ->
    throw new Error("Please specify a fully qualified URL for the API Server.") if apiServer?.indexOf('://') == -1
    throw new Error("Please specify a fully qualified URL for the Auth Server.") if authServer?.indexOf('://') == -1

    @appId = appId if appId
    @appSecret = appSecret if appSecret
    @apiServer = apiServer if apiServer
    @authServer = authServer if authServer
    @

  @with: (accessToken) ->
    throw new Error("with() cannot be called until you provide an appId and secret via config()") unless @appId and @appSecret
    throw new Error("with() must be called with an access token") unless accessToken?
    new NilasConnection(accessToken)

  @exchangeCodeForToken: (code, callback) ->
    throw new Error("exchangeCodeForToken() cannot be called until you provide an appId and secret via config()") unless @appId and @appSecret
    throw new Error("exchangeCodeForToken() must be called with a code") unless code?

    new Promise (resolve, reject) =>
      options =
        method: 'GET'
        json: true
        url: "#{@authServer}/oauth/token"
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
    "#{@authServer}/oauth/authorize?client_id=#{@appId}&trial=#{options.trial}&response_type=code&scope=email&login_hint=#{options.loginHint}&redirect_uri=#{options.redirectURI}"

module.exports = Nilas
