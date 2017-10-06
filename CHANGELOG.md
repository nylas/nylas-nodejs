###  3.1.1 / 2017-10-06

* No longer throw an error after successful calls to Message.sendRaw
* Add status to event model
* Don't require secret for urlForAuthentication, allowing client-side usage
  without leaking or faking the app secret
* Catch rejected promises in some missing cases
* Emit DeltaStream retry status as an event
* Don't console.log, ever (callers should instrument desired logging)
* Fix missing fields and typos in message and thread models

### 3.0.0 / 2016-08-14

* Add support for `view=expanded` option. Now all methods on that hit the api
  can take querystring params as objects. Additionaly, you can pass in
  `{expanded: true}` for convenience.
* **BREAKING CHANGE**: Delta stream now also supports `view=expanded`, `exclude_types`, and
  `include_types`, as well as any arbitrary querystring param.
  `Delta::startStream` now takes an object as a second argument for querystring
  params, instead of an `exclude_types` array.
