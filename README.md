# Nylas Node.js SDK  

[![Travis build status](https://travis-ci.org/nylas/nylas-nodejs.svg?branch=master)](https://travis-ci.org/nylas/nylas-nodejs)

This is the GitHub repository for the Nylas Node SDK and this repo is primarily for anyone who wants to make contributions to the SDK or install it from source. If you are looking to use Node to access the Nylas Email, Calendar, or Contacts API you should refer to our official [Node SDK Quickstart Guide](https://docs.nylas.com/docs/quickstart-node).

The Nylas Communications Platform provides REST APIs for [Email](https://docs.nylas.com/docs/quickstart-email), [Calendar](https://docs.nylas.com/docs/quickstart-calendar), and [Contacts](https://docs.nylas.com/docs/quickstart-contacts), and the Node SDK is the quickest way to build your integration using JavaScript.

Here are some resources to help you get started:

- [Nylas SDK Tutorials](https://docs.nylas.com/docs/tutorials#section-node-js)
- [Get Started with the Nylas Communications Platform](https://docs.nylas.com/docs/getting-started)
- [Sign up for your Nylas developer account.](https://nylas.com/register)
- [Nylas API Reference](https://docs.nylas.com/reference)


# Install

To run the Nylas Node SDK, you will first need to have [Node](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/get-npm) installed on your machine.

Then, head to the nearest command line and run the following:
`npm install nylas`

Alternatively, if you prefer to use [Yarn](https://yarnpkg.com/en/), you can install the Nylas Node SDK with `yarn add nylas`

To install this package from source, clone this repo and run `npm install` from inside the project directory.

```
git clone https://github.com/nylas/nylas-nodejs.git
cd nylas-nodejs
npm install
```
# Usage

Every resource (i.e., messages, events, contacts) is accessed via an instance of `Nylas`. Before making any requests, be sure to call `config` and initialize the `Nylas` instance with your `clientId` and `clientSecret`. Then, call `with` and pass it your `accessToken`. The `accessToken` allows `Nylas` to make requests for a given account's resources.

```
const Nylas = require('nylas');

Nylas.config({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});

const nylas = Nylas.with(ACCESS_TOKEN);
```

Then, you can use Nylas to access information about a user's account:
```
nylas.threads.list({}).then(threads => {
  console.log(threads.length);
});
```

For more information about how to use the Nylas Node SDK, [take a look at our quickstart guide](https://docs.nylas.com/docs/quickstart-node).

# Contributing

Please refer to [Contributing](Contributing.md) for information about how to make contributions to this project. We welcome questions, bug reports, and pull requests.

# License

This project is licensed under the terms of the MIT license. Please refer to [LICENSE](LICENSE.txt) for the full terms. 


