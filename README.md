Nylas Node.js Bindings
======================

Installation
------------
```
npm install nylas
```

Example Express App
----

A small example Express app is included in the `example` directory. you can run the sample app to see how an authentication flow might be implemented:

```
cd example
npm install
DEBUG=example:* ./bin/www
```

Note that you'll need to replace the Nylas App ID and Secret in `app.js` with your application's credentials.


API Overview
------------

Every resource is accessed via an instance of `Nylas`. Before making any requests, be sure to call `config` and initialize the `Nylas` with your `App ID` and `App Secret`.

```javascript
var Nylas = require('nylas').config({
    appId: 'c96gge1jo29pl2rebcb7utsbp',
    appSecret: 'l2rebcb7utsbpc96gge1jo29p'
});
```

Every resource method accepts an optional callback as the last argument:

```javascript
Nylas.with(accessToken).namespaces.list({}, function(namespaces){
	console.log(namespaces.length);
});
```


Additionally, every resource method returns a promise, so you don't have to use callbacks if the rest of your code is promise-friendly:

```javascript
Nylas.with(accessToken).namespaces.list({}).then(function(namespaces){
	console.log(namespaces.length);
});
```

Authentication
-----
The Nylas REST API uses server-side (three-legged) OAuth, and the Node.js bindings provide convenience methods that simplifiy the OAuth process. For more information about authenticating users with Nylas, visit the [Developer Documentation](https://www.nylas.com/docs/knowledgebase#authentication)

Step 1: Redirect the user to Nylas:

```javascript
var Nylas = require('nylas').config({
    appId: 'c96gge1jo29pl2rebcb7utsbp',
    appSecret: 'l2rebcb7utsbpc96gge1jo29p'
});

router.get('/connect', function(req, res, next) {
    options = {
        redirectURI: 'http://localhost:3000/oauth/callback',
        trial: false
    }
    res.redirect(Nylas.urlForAuthentication(options));
});
```

Step 2: Handle the Authentication Response:

```javascript
router.get('/oauth/callback', function (req, res, next) {
    if (req.query.code) {
        Nylas.exchangeCodeForToken(req.query.code).then(function(token) {
        	// save the token to the current session, save it to the user model, etc.
        });

    } else if (req.query.error) {    
        res.render('error', {
            message: req.query.reason,
            error: {
                status: 'Please try authenticating again or use a different email account.',
                stack: ''
            }
        });
    }
});
```

Fetching Namespaces
-------
In the Nylas API, every access token provides access to one or more namespaces, which represent email accounts. Currently, authenticating a user with their email account gives you an access token for just that one namespace.

To fetch the namespace for a given access token:

```javascript
Nylas.with(accessToken).namespaces.first({}).then(function(namespace){
    console.log(namespace.emailAddress); // ben@nylas.com
    console.log(namespace.provider); //gmail
});
```

Fetching Threads, Messages, etc.
-----

Threads, messages, and other resources belong to a namespace. Once you've obtained a namespace, you can query these collections in several ways. All of the query methods
take filter parameters. Available filters can be found in the [API Documentation](https://nylas.com/docs/api#filters)


```javascript

// Find the first thread matching the filter criteria

namespace.threads.first({from: 'ben@nylas.com'}).then(function(thread) {
   console.log(thread.subject);
   console.log(thread.snippet);
}) 

// Count threads with the inbox tag

namespace.threads.count({tag: 'inbox'}).then(function(count) {
   console.log('There are ' + count + 'threads in your Nylas.');
})

// Fetch a single thread

namespace.threads.find('c96gge1jo29pl2rebcb7utsbp').then(function(thread) {
   console.log(thread.subject);
}).catch(function(err) {
   console.log('Thread not found! Error: ' + err.toString());
});

// Fetch a single thread (using optional callback instead of promise)

namespace.threads.find('c96gge1jo29pl2rebcb7utsbp', function(err, thread) {
   if (err) {
      console.log('Thread not found! Error: ' + err.toString());
      return;
   }
   console.log(thread.subject);
});

// Iterate over every matching thread. Automatically paginates the underlying API
// as necessary and calls the provided block as threads are received. Calls the final
// block upon an error, or when processing is finished.

namespace.threads.forEach({tag: 'unread', from: 'no-reply@sentry.com'}, function(thread) {
   console.log(thread.subject);
}, function (err) {
   console.log('finished iterating through threads');
});

// Returns an array of all matching threads, paginating the underlying API as necessary.
// May take a long time and return many, many objects if used with a broad filter.

namespace.threads.list({tag: 'inbox'}).then(function(threads) {
});

```

Creating and Sending Drafts
------

```javascript
var draft = namespace.drafts.build({
    subject: 'My New Draft',
    to: [{email: 'ben@nylas.com'}]
});

// Sending the Draft

draft.send().then(function(draft) {
    console.log(draft.id + ' was sent');
});

// Saving a Draft

draft.save().then(function(draft) {
    console.log(draft.id + ' was saved');
});

// Retrieving and sending a saved draft

var savedId = '1234';

namespace.drafts.find(savedId).then(draft) {
	draft.send().then(function (draft) {
  	    console.log('sent!');
	});
});

```

Contributing 
----

We'd love your help making the Nylas Node.js bindings better. Join the Google Group for project updates and feature discussion. We also hang out in #nylas on irc.freenode.net, or you can email support@nylas.com.

Please sign the [Contributor License Agreement](https://www.nylas.com/cla.html) before submitting pull requests. (It's similar to other projects, like NodeJS or Meteor.)

Tests can be run with:

`npm test`