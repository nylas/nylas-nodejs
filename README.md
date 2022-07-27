# Nylas Node.js SDK  

[![Travis build status](https://travis-ci.org/nylas/nylas-nodejs.svg?branch=master)](https://travis-ci.org/nylas/nylas-nodejs)

This is the GitHub repository for the Nylas Node SDK and this repo is primarily for anyone who wants to make contributions to the SDK or install it from source. If you are looking to use Node to access the Nylas Email, Calendar, or Contacts API you should refer to our official [Node SDK Quickstart Guide](https://developer.nylas.com/docs/developer-tools/sdk/node-sdk/).

The Nylas Communications Platform provides REST APIs for [Email](https://developer.nylas.com/docs/connectivity/email/), [Calendar](https://developer.nylas.com/docs/connectivity/calendar/), and [Contacts](https://developer.nylas.com/docs/connectivity/contacts/), and the Node SDK is the quickest way to build your integration using JavaScript.

Here are some resources to help you get started:

- [Nylas SDK Tutorials](https://developer.nylas.com/docs/the-basics/tutorials/nodejs/)
- [Quickstart](https://developer.nylas.com/docs/the-basics/quickstart/)
- [Nylas API Reference](https://developer.nylas.com/docs/api/)


# Install

To install the Nylas Node SDK, you will first need to have [Node](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/get-npm) installed on your machine.

Then, head to the nearest command line and run the following:
`npm install nylas`

Alternatively, if you prefer to use [Yarn](https://yarnpkg.com/en/), you can install the Nylas Node SDK with `yarn add nylas`

To install this package from source, clone this repo and run `npm install` from inside the project directory.

```bash
git clone https://github.com/nylas/nylas-nodejs.git
cd nylas-nodejs
npm install
```

# Usage

The SDK entrypoint and application resources (i.e., application accounts, authentication, webhooks) is accessed via an instance of `Nylas`. You can initialize a `Nylas` instance with your `clientId` and `clientSecret`.

```javascript
const Nylas = require('nylas');

const nylasClient = new Nylas({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});
```

Every account resource (i.e., messages, events, contacts) is accessed via an instance of `NylasConnection`. To initialize an instance of `NylasConnection`, call `with` on your `Nylas` instance and pass it your `accessToken`.

```javascript
const nylasConnection = nylasClient.with(ACCESS_TOKEN);
```

Then, you can use Nylas to access information about a user's account:
```javascript
nylasConnection.threads.list().then(threads => {
  console.log(threads.length);
});
```

For more information about how to use the Nylas Node SDK, [take a look at our quickstart guide](https://developer.nylas.com/docs/developer-tools/sdk/node-sdk/).

# Contributing

Please refer to [Contributing](Contributing.md) for information about how to make contributions to this project. We welcome questions, bug reports, and pull requests.

# License

This project is licensed under the terms of the MIT license. Please refer to [LICENSE](LICENSE.txt) for the full terms. 


