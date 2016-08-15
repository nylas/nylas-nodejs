### 3.0.0 / 2016-08-14

* Add support for `view=expanded` option. Now all methods on that hit the api
  can take querystring params as objects. Additionaly, you can pass in
  `{expanded: true}` for convenience.
* **BREAKING CHANGE**: Delta stream now also supports `view=expanded`, `exclude_types`, and
  `include_types`, as well as any arbitrary querystring param.
  `Delta::startStream` now takes an object as a second argument for querystring
  params, instead of an `exclude_types` array.
