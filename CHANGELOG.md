# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Support `isPlaintext` boolean for messages send and drafts create requests
- Expose raw response headers on all responses via non-enumerable `rawHeaders` while keeping existing `headers` camelCased

## [7.12.0] - 2025-08-01

### Changed
- Upgraded node-fetch from v2 to v3 for better ESM support and compatibility with edge environments

### Fixed
- Fixed test expectations for file attachment sizes and content types to match actual implementation behavior
- Updated Jest configuration to properly handle ESM modules from node-fetch v3
- Removed incompatible AbortSignal import from node-fetch externals (now uses native Node.js AbortSignal)


## [7.11.0] - 2025-06-23

### Added
- Support for new message `fields` query parameter values: `include_tracking_options` and `raw_mime`
- Support for `trackingOptions` property in Message responses when using `fields=include_tracking_options`
- Support for `rawMime` property in Message responses when using `fields=raw_mime`
- `MessageTrackingOptions` interface for tracking message opens, thread replies, link clicks, and custom labels
- Support for `includeHiddenFolders` query parameter in folders list endpoint for Microsoft accounts
- Support for `singleLevel` query parameter in `ListFolderQueryParams` for Microsoft accounts to control folder hierarchy traversal

### Fixed
- Fixed 3MB payload size limit to consider total request size (message body + attachments) instead of just attachment size when determining whether to use multipart/form-data encoding

## [7.10.0] - 2025-05-27

### Added
- Support for 'zoom' as a provider type in Auth module
- Support for `tentativeAsBusy` parameter in FreeBusy requests to control how tentative events are treated

### Fixed
- Event status type to use 'maybe' instead of 'tentative' in Event interface to match API documentation
- Missing `/cancel` suffix in Notetaker API endpoint
- URL encoding for API path components to properly handle special characters

## [7.9.0] - 2025-04-30

### Added
- Support for Notetaker API endpoints
- Notetaker settings to calendar and event models
- Support for `tentativeAsBusy` parameter in availability and event listing

### Deprecated
- Providing timeout in milliseconds via request overrides - please use seconds instead

## [7.8.0] - 2025-03-03

### Added
- Support for `listImportEvents` method to import events from a specified calendar within a given time frame
- Support for returning all response headers in node sdk for error responses

### Fixed
- Grants support for queryParams in list method first parameter

## [7.7.4] - 2025-01-23

### Fixed
- `any_email` was not transformed to a comma delimited list for messages.list

## [7.7.3] - 2025-01-23

### Changed
- `latestMessageReceivedDate` & `latestMessageSentDate` to be optional on threads model

### Removed
- `createdAt` field from message model

### Fixed
- Issue where timeout was not being respected when overriding the timeout in the request options
- Issue where query params with array values were not being transformed into comma-delimited strings
- Transform anyEmail array into comma-delimited any_email parameter in threads list

## [7.7.2] - 2024-12-02

### Fixed
- `credentials` resource to use correct endpoint

## [7.7.1] - 2024-11-25

### Fixed
- Query parameters for array values

## [7.7.0] - 2024-11-14

### Added
- Support for Scheduling API

### Fixed
- Issue where inline attachments > 3Mb were not sent correctly

## [7.6.2] - 2024-10-31

### Added
- Missing `select` field on query params
- Missing `name` field on grant model
- Missing `masterEventId` on Event model

### Fixed
- Webhook rotate secret calling the wrong endpoint

## [7.6.1] - 2024-10-30

### Added
- Support for filtering events by masterEventID
- Support for gzip compression

## [7.6.0] - 2024-10-18

### Added
- Support for filtering events by attendee email
- Buffer support for file attachments
- New webhook trigger types
- EWS as a provider

### Changed
- Rotate secret endpoint from being a PUT to a POST call

### Fixed
- Issue where crypto import was causing downstream Jest incompatibilities
- FormData import compatibility issues with ESM

### Removed
- eslint-plugin-import from production dependencies

## [7.5.2] - 2024-07-12

### Fixed
- Issue where metadata was being incorrectly modified before being sent to the API

## [7.5.1] - 2024-07-09

### Added
- Collective availability method

### Fixed
- Crash when timeout encountered

### Security
- Bump `braces` sub-dependency from 3.0.2 to 3.0.3

## [7.5.0] - 2024-05-17

### Added
- Support for filtering by event type when listing events
- Support for filtering a list of folders

### Fixed
- Query parameters not being formatted properly

## [7.4.0] - 2024-05-01

### Added
- Support for `provider` field in code exchange response
- Clean messages support

### Fixed
- Issue where attachments < 3mb were not being encoded correctly

## [7.3.0] - 2024-04-15

### Added
- Response type to `sendRsvp`
- Support for adding custom headers to outgoing requests
- Support for custom headers field for drafts and messages
- Support for setting `include_grant_scopes` for auth url generation

### Changed
- Incorrect `type` field in `When` models to `object`

### Fixed
- Inaccuracy in `ReminderOverride` model

## [7.2.1] - 2024-03-05

### Added
- Default timeout to match API (90 seconds)

### Changed
- Improved message sending and draft create/update performance

### Fixed
- Serialization/deserialization of keys with numbers in them

## [7.2.0] - 2024-02-27

### Added
- Support for `roundTo` field in availability response model
- Support for `attributes` field in folder model
- Support for icloud as an auth provider

### Fixed
- Query params not showing up in method parameters for finding a message
- Missing fields in message models

### Removed
- Unnecessary `clientId` from detectProvider params

## [7.1.0] - 2024-02-12

### Added
- Support for `/v3/connect/tokeninfo` endpoint
- Models can now directly be imported from the top-level `nylas` package

### Fixed
- Inaccuracies in event and webhook models

## [7.0.0] - 2024-02-05

### Added
- Support for both ES6 and CommonJS module systems
- Models for all API resources and endpoints, for all HTTP methods to reduce confusion on which fields are available for each endpoint
- Error classes for the different API errors as well as SDK-specific errors

### Changed
- **BREAKING**: Node SDK v7 supports the Nylas API v3 exclusively, dropping support for any endpoints that are not available in v3
- **BREAKING**: Convert `Nylas` class from a static to a non-static class
- **BREAKING**: Officially support minimum Node 16
- **BREAKING**: Dropped the use of 'Collections' in favor of 'Resources'
- **BREAKING**: Removed all REST calls from models and moved them directly into resources
- Rewritten the majority of SDK to be more modular and efficient
- Removed the use of custom strings for serialization and deserialization, now automatically converting to camelCase and from the API's snake_case

### Removed
- **BREAKING**: Local Webhook development support is removed due to incompatibility

## [6.8.0] - 2023-02-03

### Added
- Local webhook testing support
- `hideParticipants` field to `Event`

## [6.7.0] - 2023-01-18

### Added
- Support for rate limit errors
- responseType to AuthenticateUrlConfig
- New attributes for Event webhook notifications

### Changed
- Event `visibility` field to be writeable

### Security
- Bump `decode-uri-component` sub-dependency from 0.2.0 to 0.2.2
- Bump `qs` sub-dependency from 6.5.2 to 6.5.3
- Bump `json5` sub-dependency from 2.1.0 to 2.2.3
- Bump `minimatch` sub-dependency from 3.0.4 to 3.1.2

## [6.6.1] - 2022-10-21

### Fixed
- Calendar color implementation

## [6.6.0] - 2022-10-14

### Added
- Additional fields for job status webhook notifications
- Support for calendar colors (for Microsoft calendars)
- Support for event reminders

### Fixed
- Typo in `SchedulerBooking.calendarInviteToGuests` attribute

### Security
- Bump `minimist` sub-dependency from 1.2.5 to 1.2.6

## [6.5.1] - 2022-09-16

### Added
- Additional `Event` fields

### Fixed
- Issue with `EventParticipant` not sending status on new event creation

## [6.5.0] - 2022-07-29

### Added
- `metadata` field to `JobStatus`
- `interval_minutes` field in Scheduler booking config

### Fixed
- `Event.originalStartTime` type to be `Date`
- `SchedulerBookingOpeningHours.accountId` deserialization
- Json value for `confirmationEmailToHost` in `SchedulerBooking`

## [6.4.2] - 2022-06-14

### Added
- `Message.save()` functionality for updating existing messages
- Missing `reminderMinutes` field in `Event`

## [6.4.1] - 2022-06-06

### Fixed
- Issue where API response data was being lost
- Incorrect tunnel index number in webhook example

## [6.4.0] - 2022-05-10

### Added
- Support for collective and group events

### Fixed
- `fileIdsToAttach` field not being set when initializing a `Draft`

## [6.3.2] - 2022-05-04

### Added
- Missing `fileIdsToAttach` field in `DraftProperties`

### Fixed
- JSON parse error when using `CalendarRestfulModelCollection.freeBusy`
- Base URL not being set for `SchedulerRestfulModelCollection` functions

## [6.3.1] - 2022-04-22

### Added
- Missing order and emails field in calendar availability

### Fixed
- Issue where passing in an array of one for `MessageRestfulModelCollection.findMultiple` throws an error

## [6.3.0] - 2022-04-14

### Added
- Support for revoking a single access token
- Improved Outbox job status support
- Support Setting Redirect On Error in Authenticate URL Config

### Fixed
- Issue where an empty response body could trigger a JSON deserialization error

### Removed
- Usage of unreliable `node-fetch response.size`

## [6.2.2] - 2022-04-01

### Added
- Allow getting raw message by message ID directly instead of needing to fetch the message first
- New `authenticationType` field in `ManagementAccount`

### Fixed
- JSON error thrown when Nylas API returns non-JSON error payload

## [6.2.1] - 2022-03-25

### Added
- Enable Nylas API v2.5 support

### Fixed
- Circular dependency issue in `Attribute`
- `SchedulerBookingOpeningHoursProperties.days` and add missing fields to Scheduler models

### Security
- Bump `node-fetch` dependency from 2.6.1 to 2.6.7
- Bump `ajv` sub-dependency from 6.10.2 to 6.12.6

## [6.2.0] - 2022-02-04

### Added
- Support for returning multiple messages by a list of message IDs
- New field in `Draft` for adding files by file IDs
- Webhook Notification models
- Improved `Delta` support: added `Delta` model and two new methods; `since` and `longpoll`

### Fixed
- Virtual Calendar logic and serialization

## [6.1.0] - 2022-01-28

### Added
- Support for `Event` to ICS
- `comment` and `phoneNumber` fields to `EventParticipant`
- Support for `calendar` field in free-busy, availability, and consecutive availability queries

### Fixed
- Issue where properties of `Model` type were sending read-only attributes to the API

## [6.0.0] - 2022-01-12

### Added
- Introduction of interfaces that accompany models to improve experience when instantiating API models and provides better insight on "required" fields
- Several `Contact` fields that took an object as a value now take a corresponding `Contact` subclass type
- New `FreeBusy` type for `CalendarRestfulModelCollection.freeBusy()` return value
- New `CalendarAvailability` type for `CalendarRestfulModelCollection.availability()` return value
- New `CalendarConsecutiveAvailability` type for `CalendarRestfulModelCollection.consecutiveAvailability()` return value
- New `AuthorizationCode` type for `Connect.authorize()` return value
- New `AccessToken` type for `Nylas.exchangeCodeForToken()` return value
- New `ApplicationDetail` type for `Nylas.application()` return and parameter types
- Lots of new models are introduced, almost all API objects are represented as a model in the SDK now
- Introduction of `Enum` types

### Changed
- **BREAKING**: Refactored `RestfulModel` and `RestfulModelCollection`, introduced `Model` and `ModelCollection` superclass for models that do not directly interact with the Nylas API
- **BREAKING**: Applied missing variable and return types, and applied stricter typing to improve deserialization and to adhere Typescript best practice
- **BREAKING**: `Event.when` is now of `When` type
- **BREAKING**: All `Event` fields for participants are now of `EventParticipant` type
- **BREAKING**: `NeuralMessageOptions` is now a `Model` class instead of an interface type
- **BREAKING**: `CalendarRestfulModelCollection.freeBusy()` now returns a (new) `FreeBusy` type instead of a JSON
- **BREAKING**: `CalendarRestfulModelCollection.availability()` now returns a (new) `CalendarAvailability` type instead of a JSON
- **BREAKING**: `CalendarRestfulModelCollection.consecutiveAvailability()` now returns a (new) `CalendarConsecutiveAvailability` type instead of a JSON
- **BREAKING**: `Connect.authorize()` now takes in a parameter of `VirtualCalendarProperties | NativeAuthenticationProperties` type (new) instead of an object and returns `AuthorizationCode` type (new) instead of a JSON
- **BREAKING**: `Connect.token()` now returns an `Account` type instead of a JSON
- **BREAKING**: `Contact`, `EventConferencing`, and `Folder` are now default exports
- **BREAKING**: `Nylas` has stricter parameters and introduction of defined return types
- **BREAKING**: `Nylas.exchangeCodeForToken()` now returns an `AccessToken` type that's a representation of the full API response as opposed to just the access token string
- **BREAKING**: `Nylas.application()` takes `ApplicationDetailProperties` type and returns an `ApplicationDetail` type

### Removed
- **BREAKING**: `RestfulModelCollection.build()` as it does not allow for proper property and type hinting in favor of instantiating via `new Model()`
- **BREAKING**: `Connect.newAccount()` as it had no functionality
- **BREAKING**: `File.metadata()` as it doesn't appear any different than making a `NylasConnection.files().find()` call

## [5.10.3] - 2022-01-04

### Fixed
- Prevent `Event` objects from sending an empty list of notifications when not set, causing errors for recurring events

## [5.10.3] - 2021-12-16

### Added
- Missing `provider` option for `urlForAuthentication`
- Job status improvements

## [5.10.2] - 2021-12-03

### Fixed
- Scheduler and Component types
- Component sending unmodifiable fields during update
- Bug where updating an event resulted in an API error

## [5.10.1] - 2021-11-22

### Fixed
- Bug where booking a valid timeslot resulted in an API error

## [5.10.0] - 2021-11-18

### Added
- Support for Event notifications
- Support for remaining Scheduler endpoints
- Metadata support for `Calendar`, `Message` and `ManagementAccount`

## [5.9.0] - 2021-09-24

### Added
- Component CRUD Support
- Scheduler support

## [5.8.0] - 2021-09-16

### Added
- Support for consecutive availability

### Fixed
- Issue where JSON.stringify would omit read-only values
- Webhook example throwing error if body is not a raw body
- Readonly calendar attributes being sent for POST and PUT calls

## [5.7.0] - 2021-08-18

### Added
- Missing fields for recurring events
- Support for conferencing

### Fixed
- Minor issues with Neural API implementation
- Not rejecting uncaught errors during requests

## [5.6.0] - 2021-07-14

### Added
- Support for `/calendars/availability` endpoint
- Support for the Neural API
- Linting, enabled and set up eslint and prettier

### Fixed
- Jest test cases not respecting async methods
- Issue with parsing raw MIME emails

## [5.5.1] - 2021-06-24

### Fixed
- Tracking object not being added to a pre-existing `draft` object
- `undefined` response when downloading file

### Removed
- `request` dependency and related import statements

## [5.5.0] - 2021-06-09

### Added
- Custom error class `NylasApiError` to add more error details returned from the API
- Support for read only fields
- Enable Nylas API v2.2 support

### Changed
- Replaced deprecated `request` library with `node-fetch`

### Fixed
- Bug where saving a `draft` object with an undefined `filesIds` would throw an error
- Typings for classes that extend `RestfulModelCollection` or `RestfulModelInstance`

## [5.4.0] - 2021-05-21

### Added
- `metadata` field in the Event model to support new Event metadata feature
- Support for filtering `metadata` using `metadata_key`, `metadata_value`, and `metadata_pair`

### Security
- Updated dependencies `lodash`, `y18n`, and `pug` to the latest stable version

## [5.3.3] - 2021-03-26

### Changed
- Pass error message from the API to the SDK user
- Migrate `delta` streaming to `node-fetch`
- Migrate `exchangeCodeForToken` to `node-fetch`

## [5.3.2] - 2021-01-11

### Fixed
- Typing fixes to `nylas.drafts` and other `RestfulModelCollections`

## [5.3.1] - 2020-11-20

### Added
- Update readme with syntax highlighting

### Changed
- Drop async dependency for smaller package fingerprint. Async is replaced with promises

### Removed
- Circular dependency in `nylas-connection.ts`

## [5.3.0] - 2020-09-23

### Added
- `JobStatus` model and collection

### Changed
- Refactor parameter ordering in `find()` and `draft.send()` methods [backwards compatible]

### Fixed
- Bug where setting `event.start` and `event.end` did not set `event.when` if `event.when` didn't exist

## [5.2.0] - 2020-07-27

### Added
- Implement support for GET /contacts/groups
- Support GET /resources
- Support POST, PUT and DELETE for calendars, and add location, timezone and isPrimary attributes
- `object` attribute to `event.when` object

### Changed
- Update lodash import

## [5.1.0] - 2020-06-04

### Added
- Support recurring events
- Implement list & update application details endpoints
- Support free-busy endpoint on Calendars collection

### Fixed
- Bug which was overwriting properties on message objects

## [5.0.0] - 2020-05-07

### Changed
- **BREAKING**: Officially support minimum Node 16

### Removed
- **BREAKING**: `appId` and `appSecret`. Please use `clientId` and `clientSecret`
- **BREAKING**: `Thread.folder`. Please use `Thread.folders`

### Added
- Migrate to Typescript

## [4.10.1] - 2020-05-06

### Fixed
- Update `exchangeCodeForToken` to reject when no `access_token` is returned
- Unhandled error when response is undefined
- Get contact picture request to correctly use callback, if provided

## [4.10.0] - 2020-02-24

### Added
- iCalUID attribute to Event model
- Allow file streaming uploads

### Changed
- Update SUPPORTED_API_VERSION to 2.1
- Update Thread.folder to use Folder model, and rename to Thread.folders

## [4.9.0] - 2020-01-24

### Added
- Update Thread participants to use EmailParticipant

### Changed
- Remove error handling in /connect models

### Security
- Bump handlebars version

## [4.8.0] - 2019-10-09

### Added
- Support for `/connect/token` endpoint

### Fixed
- Events so that they support all time subojects

## [4.7.1] - 2019-09-18

### Added
- Support for `/connect/authorize` endpoint
- Improvements to example/webhooks

### Changed
- Update formatting for DeprecationWarnings
- Update package-lock.json

### Fixed
- Draft deletion bug

## [4.7.0] - 2019-08-20

### Added
- Support for `/token-info` endpoint
- Webhooks CRUD functionality

### Changed
- Update app id and app secret to client id and client secret

## [4.6.2] - 2019-07-26

### Added
- contentDisposition to File
- emailAddress to ManagementAccount
- provider to ManagementAccount
- `groups` and `source` to contact attributes

### Changed
- Update dependancies

### Fixed
- Contact birthday type from date to string
- `emailAddresses` attribute in Contact model

## [4.6.1] - 2019-07-10

### Added
- billingState to Account model
- Update webhooks example code

### Fixed
- Error to string reassignment bug

## [4.6.0] - 2019-06-20

### Added
- Enable link tracking

## [4.5.0] - 2019-04-02

### Added
- Support for `/ip_addresses` endpoint

## [4.4.0] - 2019-03-25

### Added
- Support for `revoke-all` endpoint

## [4.3.0] - 2019-03-18

### Added
- X-Nylas-Client-Id header for HTTP requests

## [4.2.3] - 2019-02-21

### Changed
- Replace Underscore with lodash
- Replace Bluebird promises with native promises
- Upgrade all other dependencies and devDependencies to latest versions
- Reduce package size by only including `lib` directory

### Removed
- Drop unnecessary dependencies: express-session, clone

## [4.2.2] - 2018-03-08

### Added
- Status code to error to allow it to bubble up from API request errors
- Improvements to example/sample-app
- linkedAt to the account model

### Changed
- Move version mismatch warning to only print if both API and SDK versions are present. This will decrease unhelpful spamming
- Parse response into JSON if it is a string

## [4.2.0] - 2018-02-07

### Added
- Support for new contact fields and functionality

### Changed
- Bump supported Nylas API version to 2.0

## [4.1.0] - 2017-12-27

### Added
- Variable for supported version of Nylas API - set to `1.0` and will be updated when the SDK supports later versions of the API
- Warnings when the version of the API that the SDK supports differs from the version of the API that the application is using

## [4.0.0] - 2017-11-06

### Added
- ESLint and Prettier for linting
- `search()` for messages and threads
- `upgrade()` and `downgrade()` for account management
- `getRaw()` for retrieving raw messages

### Changed
- **BREAKING**: Converted Coffeescript to ES6
- **BREAKING**: Updated test framework from Jasmine 1.0 to Jest
- **BREAKING**: Changed Travis to run Node 8 and lint, build, and test code in CI
- **BREAKING**: Updated docs and example code
- **BREAKING**: Changed API for sending raw messages to use `draft.send()` instead of `Message.sendRaw()`
- **BREAKING**: Changed models for `Contact`, `Draft`, `Event`, `File`, `Folder`, `Message`, and `Thread` to accurately reflect the attribute that the API returns
- **BREAKING**: Return `Message` object instead of `Draft` object after send
- **BREAKING**: Privatized `_range()`, `_getModel()`, and `_getModelCollection()` (not documented)
- Changed `list()` to override default `offset` with user's
- Return headers correctly for `expanded` view for `Message` objects
- Return sending failures for partial sends
- Return server errors for SMTP exceptions on send

### Removed
- **BREAKING**: `draft` attribute on `Message` and `Draft` objects, since the object type is already distinguished
- **BREAKING**: Support for `Tag` objects, which has been deprecated, and instance methods on `Thread` for `Tag` changes
- **BREAKING**: Support for `generateCursor()`, which has been deprecated
- **BREAKING**: Support for the `trial` option for auth, which has been deprecated

## [3.1.1] - 2017-10-06

### Added
- Status to event model
- Emit `DeltaStream` retry status as an event

### Fixed
- No longer throw an error after successful calls to `Message.sendRaw()`
- Don't require secret for `urlForAuthentication()`, allowing client-side usage without leaking or faking the app secret
- Catch rejected promises in some missing cases
- Don't `console.log()`, ever (callers should instrument desired logging)
- Missing fields and typos in message and thread models

## [3.0.0] - 2016-08-14

### Added
- Support for `view=expanded` option. Now all methods on that hit the API can take querystring params as objects. Additionally, you can pass in `{expanded: true}` for convenience

### Changed
- **BREAKING**: `DeltaStream` now also supports `view=expanded`, `exclude_types`, and `include_types`, as well as any arbitrary query string param. `Delta::startStream` now takes an object as a second argument for query string params, instead of an `exclude_types` array
