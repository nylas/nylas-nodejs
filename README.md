# Nylas Node.js SDK Tutorial

This tutorial enables you to quickly get started in your development efforts to create a client-side web application that uses the Nylas Node.js SDK package (**nylas-nodejs**) to access an email account.

## Prerequisites

* An existing Gmail account with at least one existing message thread.
* The account must have *Conversation view* enabled in order for messages to be organized into threads.
* An existing Nylas developer account at [https://dashboard.nylas.com/](https://dashboard.nylas.com/). 

## Quick Start

The **nylas-nodejs** package contains three sample apps in the ```./example``` subdirectory: 

* ```authentication```: Demonstrates basic authentication.
* ```sample-app```: Demonstrates authentication and how to obtain information about message threads.
* ```webhooks```: Shows how to set up webhooks.

This quick start shows you how to prepare, build, and run the ```sample-app``` Node.js sample app which was written using [Express](https://expressjs.com/). 

It runs a client-side application that renders web pages in a browser. The underlying code uses the Nylas Node.js SDK to authenticate and obtain information about message threads.

### Create an App on Nylas
Before the SDK can be used, you must first create an application in your Nylas developer account:

1. Log in to the Nylas [dashboard](https://dashboard.nylas.com/).
2. Click **Create New Application**.
3. Enter an application name, select **Web** for the platform, and click **Create Application**. The new application appears in the list.
4. Click **Edit** to edit the new application's details.
5. Click the **Callbacks** tab, paste ```http://localhost:3000/oauth/callback``` into the input field, and click **Add Callback**. 
6. Return to the list of applications and locate the new application in the list.
7. Locate the **Client Secret** field and click on the eyeball icon to show the secret. This Client Secret, along with the Client ID, will be used in the next section.

### Build and Run the Sample Application 
Follow the steps below to prepare and run the sample app:

1. Navigate to ```./example/sample-app```.
2. Open ```app.js``` in a text editor.
3. Replace all instances of ```<app ID here>``` with your Nylas application's Client ID.
4. Replace all instances of ```<app secret here>``` with your Nylas application's Client Secret.
5. Replace all instances of ```<session secret here>``` with a secret value of your choice.
6. Save ```app.js```.
7. Open a terminal window and navigate to ```./example/sample-app```.
8. Run the following command to install the sample app's dependencies:
```shell
npm install
```
9. Run the sample app:
```shell
npm start
```
10. Navigate to ```http://localhost:3000``` in your browser to display the sample app's main page.
11. Click **Sign In**.
12. Enter your Gmail address in the input field and click **Sign In**. When the app is run for the first time, it will redirect you to a Google authorization screen where you must authorize the application to access your Gmail account. Once completed, the screen will display ```Your account has been linked!```.
13. Click **First thread**. This invokes the ```threads.first``` method in the API to get and display information about the first message thread.
14. Click **Try Another Function** to return to the previous screen.
15. Click **List of threads**. This invokes the ```threads.list``` method to get and display a list of message threads.

## Steps to Create the Sample 

The following subsections explain how key elements of the sample app were prepared:

* [Set up the Dependencies](#set-up-the-dependencies)
* [Create the Style sheets](#create-the-style-sheets)
* [Create the Pugs](#create-the-pugs)
* [Set up the Routes](#set-up-the-routes)

### Set up the Dependencies

```./example/sample-app/package.json``` defines the dependencies required by the sample app.

### Create the Style Sheets

```./example/sample-app/public/stylesheets/style.css``` defines basic style information for the presentation.

### Create the Pugs

The ```./example/sample-app/views``` subdirectory contains a series of Pugs to inject information into the web pages before they are rendered:

Pug|Description                                       
---|---
```dashboard.pug```|The main screen containing the links to display the first thread and a list of threads.
```error.pug```|!Displays error information.
```index.pug```|The sign-in screen.
```layout.pug```|Sets up the main layout.
```thread.pug```|Displays the first message thread.
```threadlist.pug```|Displays a list of message threads.


### Set up the Routes

```./example/sample-app/routes``` contains the following routes:

* ```dashboard.js```: Defines the root (```/```) route that displays a message indicating that the specified email account has been linked to the Nylas account.
* ```index.js```: Defines the root (```/```) route that displays the welcome screen with a link to sign in. The link is constructed using the ```urlForAuthentication``` API which starts the OAuth process:
```shell
router.get('/', function(req, res, next) {
  options = {
    redirectURI: 'http://localhost:3000/oauth/callback',
    trial: false,
  };
  res.render('index', {
    title: 'Welcome',
    message: 'Link your email to get started.',
    url: Nylas.urlForAuthentication(options),
  });
});
```
The Nylas REST API uses server-side (three-legged) OAuth, and the Node.js bindings provide convenience methods that simplify the OAuth process. For more information about authenticating users with Nylas, visit the [API docs](https://nylas.com/docs/#authentication).

```urlForAuthentication()``` takes in an ```options``` object, which must have a ```redirectURI``` property defined. Additional optional properties include:

- ```loginHint```: The user's email address, if known.
- ```state```: An arbitrary string that will be returned back as a query parameter in your `redirectURI`.
- ```scopes```: An array specifying which scopes you'd like to authorize such as ```'email'```, ```'calendar'```, and ```'contacts'```. If omitted, the method defaults to all scopes.

```index.js``` also defines a ```/oauth/callback``` route for the callback which will receive the authentication code from Nylas once the user has signed in. The callback then exchanges the code for an auth token using the ```exchangeCodeForToken``` API:
```shell
router.get('/oauth/callback', function(req, res, next) {
  if (req.query.code) {
    Nylas.exchangeCodeForToken(req.query.code).then(function(token) {
      req.session.token = token;
      res.redirect('/dashboard');
    });
  } else if (req.query.error) {
    res.render('error', {
    ...
    });
  }
});
```
* ```threads.js```: Defines ```/first``` and ```/list``` routes which invoke Nylas APIs to get and display the first message thread and a list of message threads respectively:
```shell
router.get('/first', function(req, res, next) {
  var nylas = Nylas.with(req.session.token);
  var accountP = nylas.account.get();
  var threadP = nylas.threads.first();
  Promise.all([accountP, threadP]).then(function([account, thread]) {
    res.render('thread', {
      account: account.emailAddress,
      thread: thread,
    });
  });
});
```
```shell
router.get('/list', function(req, res, next) {
  var nylas = Nylas.with(req.session.token);
  nylas.threads.list({ limit: 10 }).then(function(threadList) {
    res.render('threadList', {
      threads: threadList,
    });
  });
});
```

## Configure Resources

Use the following steps to prepare the application:

* [Create a Nylas Instance](#create-a-nylas-instance) 
* [Prepare the Session](#prepare-the-session)
* [Assign the Routes](#assign-the-routes)

### Create a Nylas Instance

```app.js``` contains the logic for the sample app. The script starts by creating an Express app and then adds the necessary elements to the ```app``` object throughout the script:

```javascript
var app = express();
```

Every resource (i.e., messages, events, contacts, etc.) is accessed via an instance of Nylas. Before making any requests, you must call ```config``` and initialize the Nylas instance with your APP ID and secret as shown here:

```javascript
var nylasAppConfigs = {
  appId: '95f...',
  appSecret: '5s827...',
};

global.Nylas = require('nylas').config(nylasAppConfigs);
```

**Note**: The Nylas object must still be authenticated before any requests can be made. This step is handled in the ```/``` route as described above, once the web page is accessed in the browser.

### Prepare the Session

The script sets up a secret for the session and passes it to the Express app:

```javascript
var sessionSecret = {
  secret: 'mysecret',
};

app.use(
  session(
    Object.assign(
      {
        resave: false,
        saveUninitialized: true,
      },
      sessionSecret
    )
  )
);
```

### Assign the Routes

The script then configures the Express app to use the three routes defined in the sample app:

```javascript
app.use('/', routes);
app.use('/threads', checkAuth, threads);
app.use('/dashboard', checkAuth, dashboard);
```

## Contributing

We'd love your help making the Nylas Node.js SDK better. Come chat in the [Nylas community Slack channel](http://slack-invite.nylas.com/) or email support@nylas.com.

Please sign the [Contributor License Agreement](https://goo.gl/forms/lKbET6S6iWsGoBbz2) before submitting pull requests (it's similar to other projects, like NodeJS or Meteor).

Tests can be run with:

`npm test`

Our linter can be run with:

`npm run lint`

To use the package during local development, symlink the directory:

`npm link` in the `nylas-nodejs` directory.
`npm link nylas` in the directory with your code that uses the package.
