# Changelog

### 4.8.0 / 2019-10-09

* Add support for `/connect/token` endpoint
* Fix events so that they support all time subojects

### 4.7.1 / 2019-09-18

* Update formatting for DeprecationWarnings
* Update package-lock.json
* Add support for `/connect/authorize` endpoint
* Fix draft deletion bug
* Improvements to example/webhooks

### 4.7.0 / 2019-08-20

* Update app id and app secret to client id and client secret
* Add support for `/token-info` endpoint
* Add webhooks CRUD functionality

### 4.6.2 / 2019-07-26

* Add contentDisposition to File
* Add emailAddress to ManagementAccount
* Add provider to ManagementAccount
* Update dependancies
* Add `groups` and `source` to contact attributes
* Fix contact birthday type from date to string
* Fix `emailAddresses` attribute in Contact model

### 4.6.1 / 2019-07-10

* Add billingState to Account model
* Fix error to string reassignment bug
* Update webhooks example code

### 4.6.0 / 2019-06-20

* Enable link tracking

### 4.5.0 / 2019-04-02

* Add support for `/ip_addresses` endpoint

### 4.4.0 / 2019-03-25

* Add support for `revoke-all` endpoint

### 4.3.0 / 2019-03-18

* Add X-Nylas-Client-Id header for HTTP requests

### 4.2.3 / 2019-02-21

* Drop unnecessary dependencies: express-session, clone
* Replace Underscore with lodash
* Replace Bluebird promises with native promises
* Upgrade all other dependencies and devDependencies to latest versions
* Reduce package size by only including `lib` directory

### 4.2.2 / 2018-03-08

* Add  status code to error to allow it to bubble up from API request errors
* Improvements to example/sample-app
* Move version mismatch warning to only print if both API and SDK versions are present. This will decrease unhelpful spamming.
* Add linkedAt to the account model
* Parse response into JSON if it is a string.

Note: version 4.2.1 was not released.

### 4.2.0 / 2018-02-07

* Bump supported Nylas API version to 2.0
* Add support for new contact fields and functionality


### 4.1.0 / 2017-12-27

* Added variable for supported version of Nylas API - set to `1.0` and will be updated when the SDK supports later versions of the API
* Added warnings when the version of the API that the SDK supports differs from the version of the API that the application is using

### 4.0.0 / 2017-11-06

* Converted Coffeescript to ES6
* Added ESLint and Prettier for linting
* Updated test framework from Jasmine 1.0 to Jest
* Changed Travis to run Node 8 and lint, build, and test code in CI
* Updated docs and example code
* Added `search()` for messages and threads
* Added `upgrade()` and `downgrade()` for account management
* Added `getRaw()` for retrieving raw messages
* **BREAKING CHANGE**: Changed API for sending raw messages to use `draft.send()` instead of `Message.sendRaw()`
* Changed `list()` to override default `offset` with user’s
* **BREAKING CHANGE**: Changed models for `Contact`, `Draft`, `Event`, `File`, `Folder`, `Message`, and `Thread` to accurately reflect the attribute that the API returns
* Return headers correctly for `expanded` view for `Message` objects
* **BREAKING CHANGE**: Return `Message` object instead of `Draft` object after send
* Return sending failures for partial sends
* Return server errors for SMTP exceptions on send
* **BREAKING CHANGE**: Privatized `_range()`, `_getModel()`, and `_getModelCollection()` (not documented)
* **BREAKING CHANGE**: Removed `draft` attribute on `Message` and `Draft` objects, since the object type is already distinguished
* **BREAKING CHANGE**: Removed support for `Tag` objects, which has been deprecated, and instance methods on `Thread` for `Tag` changes
* **BREAKING CHANGE**: Removed support for `generateCursor()`, which has been deprecated
* **BREAKING CHANGE**: Removed support for the `trial` option for auth, which has been deprecated

###  3.1.1 / 2017-10-06

* No longer throw an error after successful calls to `Message.sendRaw()`
* Add status to event model
* Don't require secret for `urlForAuthentication()`, allowing client-side usage without leaking or faking the app secret
* Catch rejected promises in some missing cases
* Emit `DeltaStream` retry status as an event
* Don't `console.log()`, ever (callers should instrument desired logging)
* Fix missing fields and typos in message and thread models

### 3.0.0 / 2016-08-14

* Add support for `view=expanded` option. Now all methods on that hit the API can take querystring params as objects. Additionally, you can pass in `{expanded: true}` for convenience.
* **BREAKING CHANGE**: `DeltaStream` now also supports `view=expanded`, `exclude_types`, and `include_types`, as well as any arbitrary query string param. `Delta::startStream` now takes an object as a second argument for query string params, instead of an `exclude_types` array.
