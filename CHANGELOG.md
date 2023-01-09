# Changelog

### Unreleased
* Added support for rate limit errors
* Changed Event `visibility` field to be writeable
* Add new attributes for Event webhook notifications

## 6.6.1 / 2022-10-21
* Fix calendar color implementation

### 6.6.0 / 2022-10-14
* Add additional fields for job status webhook notifications
* Add support for calendar colors (for Microsoft calendars)
* Add support for event reminders
* Fix typo in `SchedulerBooking.calendarInviteToGuests` attribute
* Bump `minimist` sub-dependency from 1.2.5 to 1.2.6

### 6.5.1 / 2022-09-16
* Add additional `Event` fields
* Fix issue with `EventParticipant` not sending status on new event creation

### 6.5.0 / 2022-07-29
* Add `metadata` field to `JobStatus`
* Add `interval_minutes` field in Scheduler booking config
* Fixed `Event.originalStartTime` type to be `Date`
* Fixed `SchedulerBookingOpeningHours.accountId` deserialization
* Fixed json value for `confirmationEmailToHost` in `SchedulerBooking`

### 6.4.2 / 2022-06-14
* Add `Message.save()` functionality for updating existing messages
* Add missing `reminderMinutes` field in `Event`

### 6.4.1 / 2022-06-06
* Fixed issue where API response data was being lost
* Fixed incorrect tunnel index number in webhook example

### 6.4.0 / 2022-05-10
* Support collective and group events
* Fix `fileIdsToAttach` field not being set when initializing a `Draft`

### 6.3.2 / 2022-05-04
* Add missing `fileIdsToAttach` field in `DraftProperties`
* Fix JSON parse error when using `CalendarRestfulModelCollection.freeBusy`
* Fix base URL not being set for `SchedulerRestfulModelCollection` functions

### 6.3.1 / 2022-04-22
* Add missing order and emails field in calendar availability
* Fix issue where passing in an array of one for `MessageRestfulModelCollection.findMultiple` throws an error

### 6.3.0 / 2022-04-14
* Add support for revoking a single access token
* Improve Outbox job status support
* Support Setting Redirect On Error in Authenticate URL Config
* Fix issue where an empty response body could trigger a JSON deserialization error
* Remove usage of unreliable `node-fetch response.size`

### 6.2.2 / 2022-04-01
* Allow getting raw message by message ID directly instead of needing to fetch the message first
* Add new `authenticationType` field in `ManagementAccount`
* Fix JSON error thrown when Nylas API returns non-JSON error payload

### 6.2.1 / 2022-03-25
* Fix circular dependency issue in `Attribute`
* Fix `SchedulerBookingOpeningHoursProperties.days` and add missing fields to Scheduler models
* Enable Nylas API v2.5 support
* Bump `node-fetch` dependency from 2.6.1 to 2.6.7
* Bump `ajv` sub-dependency from 6.10.2 to 6.12.6

### 6.2.0 / 2022-02-04
* Add support for returning multiple messages by a list of message IDs
* Add new field in `Draft` for adding files by file IDs
* Add Webhook Notification models
* Improved `Delta` support: added `Delta` model and two new methods; `since` and `longpoll`
* Fix Virtual Calendar logic and serialization

### 6.1.0 / 2022-01-28
* Add support for `Event` to ICS
* Add `comment` and `phoneNumber` fields to `EventParticipant`
* Add support for `calendar` field in free-busy, availability, and consecutive availability queries
* Fix issue where properties of `Model` type were sending read-only attributes to the API

### 6.0.0 / 2022-01-12
* **BREAKING CHANGE**: Refactored `RestfulModel` and `RestfulModelCollection`, introduced `Model` and `ModelCollection` superclass for models that do not directly interact with the Nylas API
* **BREAKING CHANGE**: Introduction of interfaces that accompany models to improve experience when instantiating API models and provides better insight on "required" fields
* **BREAKING CHANGE**: Applied missing variable and return types, and applied stricter typing to improve deserialization and to adhere Typescript best practice
* **BREAKING CHANGE**: `Event.when` is now of `When` type
* **BREAKING CHANGE**: All `Event` fields for participants are now of `EventParticipant` type
* **BREAKING CHANGE**: Several `Contact` fields that took an object as a value now take a corresponding `Contact` subclass type
* **BREAKING CHANGE**: `NeuralMessageOptions` is now a `Model` class instead of an interface type
* **BREAKING CHANGE**: `CalendarRestfulModelCollection.freeBusy()` now returns a (new) `FreeBusy` type instead of a JSON
* **BREAKING CHANGE**: `CalendarRestfulModelCollection.availability()` now returns a (new) `CalendarAvailability` type instead of a JSON
* **BREAKING CHANGE**: `CalendarRestfulModelCollection.consecutiveAvailability()` now returns a (new) `CalendarConsecutiveAvailability` type instead of a JSON
* **BREAKING CHANGE**: `Connect.authorize()` now takes in a parameter of `VirtualCalendarProperties | NativeAuthenticationProperties` type (new) instead of an object and returns `AuthorizationCode` type (new) instead of a JSON
* **BREAKING CHANGE**: `Connect.token()` now returns an `Account` type instead of a JSON
* **BREAKING CHANGE**: `Contact`, `EventConferencing`, and `Folder` are now default exports
* **BREAKING CHANGE**: `Nylas` has stricter parameters and introduction of defined return types
* **BREAKING CHANGE**: `Nylas.exchangeCodeForToken()` now returns an `AccessToken` type that's a representation of the full API response as opposed to just the access token string
* **BREAKING CHANGE**: `Nylas.application()` takes `ApplicationDetailProperties` type and returns an `ApplicationDetail` type
* **BREAKING CHANGE**: Removed `RestfulModelCollection.build()` as it does not allow for proper property and type hinting in favor of instantiating via `new Model()`
* **BREAKING CHANGE**: Removed `Connect.newAccount()` as it had no functionality
* **BREAKING CHANGE**: Removed `File.metadata()` as it doesn't appear any different than making a `NylasConnection.files().find()` call
* Lots of new models are introduced, almost all API objects are represented as a model in the SDK now
* Introduction of `Enum` types

### 5.10.3 / 2022-01-04
* Prevent `Event` objects from sending an empty list of notifications when not set, causing errors for recurring events 

### 5.10.3 / 2021-12-16
* Add missing `provider` option for `urlForAuthentication`
* Job status improvements

### 5.10.2 / 2021-12-03
* Fix Scheduler and Component types
* Fix Component sending unmodifiable fields during update
* Fix bug where updating an event resulted in an API error

### 5.10.1 / 2021-11-22
* Fix bug where booking a valid timeslot resulted in an API error

### 5.10.0 / 2021-11-18
* Add support for Event notifications
* Add support for remaining Scheduler endpoints
* Add metadata support for `Calendar`, `Message` and `ManagementAccount`

### 5.9.0 / 2021-09-24
* Add Component CRUD Support
* Add Scheduler support

### 5.8.0 / 2021-09-16
* Add support for consecutive availability
* Fix issue where JSON.stringify would omit read-only values
* Fix webhook example throwing error if body is not a raw body
* Fix readonly calendar attributes being sent for POST and PUT calls

### 5.7.0 / 2021-08-18
* Fix minor issues with Neural API implementation
* Fix not rejecting uncaught errors during requests
* Add missing fields for recurring events
* Add support for conferencing

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
