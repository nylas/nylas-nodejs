# Nylas Node.js SDK

The Nylas Node.js SDK provides all of the functionality of the Nylas [REST API](https://docs.nylas.com/reference) in an easy-to-use JavaScript API. With the SDK, you can programmatically access an email account (e.g., Gmail, Yahoo, etc.) and perform functionality such as getting messages, listing message threads, etc.

# Table of Contents

* [Install](#install)
* [Usage](#usage)
* [Quick Start](#quick-start)
* [Contributing](#contributing)

# Install

Install the SDK using one of the following commands:

```shell
npm install nylas
```

or

```shell
yarn add nylas
```

# Usage

Every resource (i.e. messages, events, contacts, etc.) is accessed via an instance of ```Nylas```. Before making any requests, call ```config``` and initialize the Nylas instance with your APP ID and APP Secret. Then, call ```with``` and pass it your access token. The access token allows Nylas to make requests for a given email account's resources.

```javascript
const Nylas = require('nylas');

Nylas.config({
  appId: APP_ID,
  appSecret: APP_SECRET,
});

const nylas = Nylas.with(ACCESS_TOKEN);
```

You can then use the API to access the account. The following example lists all email threads in an email account:

```javascript
nylas.threads.list({}, (err, threads) => {
  console.log(threads.length);
});
```

# Quick Start

A quick start tutorial on how to get up and running with the SDK is available [here](https://docs.nylas.com/docs/nodejs-quick-start).

# Contributing

We'd love your help making the Nylas Node.js SDK better. Come chat in the [Nylas community Slack channel](http://slack-invite.nylas.com/) or email support@nylas.com.

Please sign the [Contributor License Agreement](https://goo.gl/forms/lKbET6S6iWsGoBbz2) before submitting pull requests (it's similar to other projects, like NodeJS or Meteor).

Tests can be run with:

`npm test`

Our linter can be run with:

`npm run lint`

To use the package during local development, symlink the directory:

`npm link` in the `nylas-nodejs` directory.
`npm link nylas` in the directory with your code that uses the package.
