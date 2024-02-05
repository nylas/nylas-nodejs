<a href="https://www.nylas.com/">
    <img src="https://brand.nylas.com/assets/downloads/logo_horizontal_png/Nylas-Logo-Horizontal-Blue_.png" alt="Aimeos logo" title="Aimeos" align="right" height="60" />
</a>

# Nylas Node.js SDK  

[![npm](https://img.shields.io/npm/v/nylas)
](https://www.npmjs.com/package/nylas)
[![codecov](https://codecov.io/gh/nylas/nylas-nodejs/branch/main/graph/badge.svg?token=94IMGU4F09)](https://codecov.io/gh/nylas/nylas-nodejs)

This is the GitHub repository for the Nylas Node SDK. This repo is primarily for anyone who wants to make contributions to the SDK, or install it from source. If you are looking to use Node to access the Nylas Email, Calendar, or Contacts API you should refer to our official [Node SDK Quickstart Guide](https://developer.nylas.com/docs/developer-tools/sdk/node-sdk/).

The Nylas Communications Platform provides REST APIs for [Email](https://developer.nylas.com/docs/connectivity/email/), [Calendar](https://developer.nylas.com/docs/connectivity/calendar/), and [Contacts](https://developer.nylas.com/docs/connectivity/contacts/), and the Node SDK is the quickest way to build your integration using JavaScript.

Here are some resources to help you get started:

- [Sign up for your free Nylas account](https://dashboard.nylas.com/register)
- [Sign up for the Nylas v3 Beta program to access the v3 Dashboard](https://info.nylas.com/apiv3betasignup.html?utm_source=github&utm_medium=devrel-surfaces&utm_campaign=&utm_content=node-sdk-upgrade)
- [Nylas API v3 Quickstart Guide](https://developer.nylas.com/docs/v3-beta/v3-quickstart/)
- [Nylas SDK Reference](https://nylas-nodejs-sdk-reference.pages.dev/)
- [Nylas API Reference](https://developer.nylas.com/docs/api/)
- [Nylas Samples repo for code samples and example applications](https://github.com/orgs/nylas-samples/repositories?q=&type=all&language=javascript)

## ⚙️ Install

**Note:** The Nylas Node SDK requires Node.js v16 or later.

### Set up using npm

To run the Nylas Node SDK, first install [Node](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/get-npm) on your machine.

Then, head to the nearest command line and run the following:
`npm install nylas`

Alternatively, you can use [Yarn](https://yarnpkg.com/en/) to install the Nylas Node SDK by running the `yarn add nylas` command.

### Build from source

To install this package from source, clone this repo and run `npm install` from inside the project directory.

```bash
git clone https://github.com/nylas/nylas-nodejs.git
cd nylas-nodejs
npm install
```

## ⚡️ Usage

To use this SDK, you must first [get a free Nylas account](https://dashboard.nylas.com/register).

Then, follow the Quickstart guide to [set up your first app and get your API keys](https://developer.nylas.com/docs/v3-beta/v3-quickstart/).

For code examples that demonstrate how to use this SDK, take a look at our [Node repos in the Nylas Samples collection](https://github.com/orgs/nylas-samples/repositories?q=&type=all&language=javascript&sort=).

### 🚀 Making Your First Request

You access Nylas resources (messages, calendars, events, contacts) through an instance of `Nylas`. The `Nylas` object must be initialized with your Nylas API key, and you can provide other additional configurations such as the Nylas API url and the timeout.

```typescript
import Nylas from "nylas";

const nylas = new Nylas({
  apiKey: "NYLAS_API_KEY",
});
```

Once initialized you can use the object to make requests for a given account's resources, for example to list all the calendars for a given account:

```typescript
nylas.calendars.list({ identifier: "GRANT_ID" }).then(calendars => {
  console.log(calendars);
});
```

## 📚 Documentation

Nylas maintains a [reference guide for the Node SDK](https://nylas-nodejs-sdk-reference.pages.dev/) to help you get familiar with the available methods and classes.

## ✨ Upgrading from 6.x

See [UPGRADE.md](UPGRADE.md) for instructions on upgrading from 6.x to 7.x.

**Note**: The Node SDK v7.x is not compatible with the Nylas API earlier than v3-beta.

## 💙 Contributing

Please refer to [Contributing](Contributing.md) for information about how to make contributions to this project. We welcome questions, bug reports, and pull requests.

## 📝 License

This project is licensed under the terms of the MIT license. Please refer to [LICENSE](LICENSE.txt) for the full terms.
