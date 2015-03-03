Nilas = require '../nilas'
NilasConnection = require '../nilas-connection'
Promise = require 'bluebird'
request = require 'request'

testUntil = (fn) ->
  finished = false
  runs ->
    fn (callback) ->
      finished = true
  waitsFor -> finished

describe "Nilas", ->
  beforeEach ->
    Nilas.appId = undefined
    Nilas.appSecret = undefined
    Nilas.apiServer = 'https://api.nilas.com'
    Nilas.authServer = 'https://www.nilas.com'
    Promise.onPossiblyUnhandledRejection (e, promise) ->

  describe "config", ->
    it "should allow you to populate the appId, appSecret, apiServer and authServer options", ->
      newConfig = 
        appId: 'newId'
        appSecret: 'newSecret'
        apiServer: 'https://api-staging.nilas.com/'
        authServer: 'https://www-staging.nilas.com/'

      Nilas.config(newConfig)
      expect(Nilas.appId).toBe(newConfig.appId)
      expect(Nilas.appSecret).toBe(newConfig.appSecret)
      expect(Nilas.apiServer).toBe(newConfig.apiServer)
      expect(Nilas.authServer).toBe(newConfig.authServer)

    it "should not override existing values unless new values are provided", ->
      newConfig = 
        appId: 'newId'
        appSecret: 'newSecret'

      Nilas.config(newConfig)
      expect(Nilas.appId).toBe(newConfig.appId)
      expect(Nilas.appSecret).toBe(newConfig.appSecret)
      expect(Nilas.apiServer).toBe('https://api.nilas.com')
      expect(Nilas.authServer).toBe('https://www.nilas.com')

    it "should throw an exception if the server options do not contain ://", ->
      newConfig = 
        appId: 'newId'
        appSecret: 'newSecret'
        apiServer: 'dontknowwhatImdoing.nilas.com'

      expect( -> Nilas.config(newConfig)).toThrow()

  describe "with", ->
    it "should throw an exception if an access token is not provided", ->
      expect( -> Nilas.with()).toThrow()

    it "should throw an exception if the app id and secret have not been configured", ->
      expect( -> Nilas.with('test-access-token')).toThrow()

    it "should return an NilasConnection for making requests with the access token", ->
      Nilas.config
        appId: 'newId'
        appSecret: 'newSecret'

      conn = Nilas.with('test-access-token')
      expect(conn instanceof NilasConnection).toEqual(true)

  describe "exchangeCodeForToken", ->
    beforeEach ->
      Nilas.config
        appId: 'newId'
        appSecret: 'newSecret'

    it "should throw an exception if no code is provided", ->
      expect( -> Nilas.exchangeCodeForToken()).toThrow()

    it "should throw an exception if the app id and secret have not been configured", ->
      Nilas.appId = undefined
      Nilas.appSecret = undefined
      expect( -> Nilas.exchangeCodeForToken('code-from-server')).toThrow()

    it "should return a promise", ->
      p = Nilas.exchangeCodeForToken('code-from-server')
      expect(p instanceof Promise).toBe(true)

    it "should make a request to /oauth/token with the correct grant_type and client params", ->
      spyOn(request, 'Request').andCallFake (options) ->
        expect(options.url).toEqual('https://www.nilas.com/oauth/token')
        expect(options.qs).toEqual({
          "client_id":"newId",
          "client_secret":"newSecret",
          "grant_type":"authorization_code",
          "code":"code-from-server"
        })
      Nilas.exchangeCodeForToken('code-from-server')

    it "should resolve with the returned access_token", ->
      spyOn(request, 'Request').andCallFake (options) ->
        options.callback(null, null, {access_token: '12345'})

      testUntil (done) ->
        p = Nilas.exchangeCodeForToken('code-from-server').then (accessToken) ->
          expect(accessToken).toEqual('12345')
          done()

    it "should reject with the request error", ->
      error = new Error("network error")
      spyOn(request, 'Request').andCallFake (options) ->
        options.callback(error, null, null)

      testUntil (done) ->
        p = Nilas.exchangeCodeForToken('code-from-server').catch (returnedError) ->
          expect(returnedError).toBe(error)
          done()

    describe "when provided an optional callback", ->
      it "should call it with the returned access_token", ->
        spyOn(request, 'Request').andCallFake (options) ->
          options.callback(null, null, {access_token: '12345'})
        testUntil (done) ->
          Nilas.exchangeCodeForToken 'code-from-server', (returnedError, accessToken) ->
            expect(accessToken).toBe('12345')
            done()

      it "should call it with the request error", ->
        error = new Error("network error")
        spyOn(request, 'Request').andCallFake (options) ->
          options.callback(error, null, null)

        testUntil (done) ->
          Nilas.exchangeCodeForToken 'code-from-server', (returnedError, accessToken) ->
            expect(returnedError).toBe(error)
            done()

  describe "urlForAuthentication", ->
    beforeEach ->
      Nilas.config
        appId: 'newId'
        appSecret: 'newSecret'

    it "should require a redirectURI", ->
      expect( -> Nilas.urlForAuthentication()).toThrow()

    it "should throw an exception if the app id and secret have not been configured", ->
      Nilas.appId = undefined
      options =
        redirectURI: 'https://localhost/callback'
      expect( -> Nilas.urlForAuthentication(options)).toThrow()

    it "should generate the correct authentication URL", ->
      options =
        redirectURI: 'https://localhost/callback'
      expect(Nilas.urlForAuthentication(options)).toEqual('https://www.nilas.com/oauth/authorize?client_id=newId&trial=false&response_type=code&scope=email&login_hint=&redirect_uri=https://localhost/callback')

    it "should use a login hint when provided in the options", ->
      options =
        loginHint: 'ben@nilas.com'
        redirectURI: 'https://localhost/callback'
      expect(Nilas.urlForAuthentication(options)).toEqual('https://www.nilas.com/oauth/authorize?client_id=newId&trial=false&response_type=code&scope=email&login_hint=ben@nilas.com&redirect_uri=https://localhost/callback')

    it "should use trial = true when provided in the options", ->
      options =
        loginHint: 'ben@nilas.com'
        redirectURI: 'https://localhost/callback'
        trial: true
      expect(Nilas.urlForAuthentication(options)).toEqual('https://www.nilas.com/oauth/authorize?client_id=newId&trial=true&response_type=code&scope=email&login_hint=ben@nilas.com&redirect_uri=https://localhost/callback')

