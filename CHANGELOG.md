# Changelog

### 5.6.0 / 2021-07-14
* Fix Jest test cases not respecting async methods
* Fix issue with parsing raw MIME emails
* Add linting, enabled and set up eslint and prettier
* Add support for `/calendars/availability` endpoint
* Add support for the Neural API

### 5.5.1 / 2021-06-24
* Fix tracking object not being added to a pre-existing `draft` object
* Removed `request` dependency and related import statements
* Fix `undefined` response when downloading file

### 5.5.0 / 2021-06-09
* Fix bug where saving a `draft` object with an undefined `filesIds` would throw an error
* Replaced deprecated `request` library with `node-fetch`
* Add custom error class `NylasApiError` to add more error details returned from the API
* Add support for read only fields
* Enabled Nylas API v2.2 support
* Fix typings for classes that extend `RestfulModelCollection` or `RestfulModelInstance`

### 5.4.0 / 2021-05-21
* Add `metadata` field in the Event model to support new Event metadata feature
* Add support for filtering `metadata` using `metadata_key`, `metadata_value`, and `metadata_pair`
* Updated dependencies `lodash`, `y18n`, and `pug` to the latest stable version

### 5.3.3 / 2021-03-26
* Pass error message from the API to the SDK user
* Migrate `delta` streaming to `node-fetch`
* Migrate `exchangeCodeForToken` to `node-fetch`

### 5.3.2 / 2021-01-11
* Typing fixes to `nylas.drafts` and other `RestfulModelCollections`

### 5.3.1 / 2020-11-20
* Drop async dependency for smaller package fingerprint. Async is replaced with promises.
* Remove circular dependency in `nylas-connection.ts`
* Update readme with syntax highlighting

### 5.3.0 / 2020-09-23
* Fix bug where setting `event.start` and `event.end` did not set `event.when` if `event.when` didn't exist
* Refactor parameter ordering in `find()` and `draft.send()` methods [backwards compatible]
* Add `JobStatus` model and collection

### 5.2.0 / 2020-07-27
* Implement support for GET /contacts/groups
* Update lodash import
* Support GET /resources
* Support POST, PUT and DELETE for calendars, and add location, timezone and isPrimary attributes.
* Add `object` attribute to `event.when` object

### 5.1.0 / 2020-06-04
* Fix bug which was overwriting properties on message objects.
* Support recurring events.
* Implement list & update application details endpoints.
* Support free-busy endpoint on Calendars collection.

### 5.0.0 / 2020-05-07

* [BREAKING] remove `appId` and `appSecret`. Please use `clientId` and `clientSecret`.
* [BREAKING] remove `Thread.folder`. Please use `Thread.folders`.
* Migrate to Typescript

### 4.10.1 / 2020-05-06

* Update `exchangeCodeForToken` to reject when no `access_token` is returned.
* Fix unhandled error when response is undefined.
* Fix get contact picture request to correctly use callback, if provided.

### 4.10.0 / 2020-02-24

* Add iCalUID attribute to Event model
* Update SUPPORTED_API_VERSION to 2.1
* Allow file streaming uploads
* Update Thread.folder to use Folder model, and rename to Thread.folders

### 4.9.0 / 2020-01-24

* Remove error handling in /connect models
* Update Thread participants to use EmailParticipant
* Bump handlebars version

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
