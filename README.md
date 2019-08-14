Nylas Node.js SDK  [![Travis build status](https://travis-ci.org/nylas/nylas-nodejs.svg?branch=master)](https://travis-ci.org/nylas/nylas-nodejs)
======================

Installation
------------
Install the Nylas SDK:

`npm install nylas` or `yarn add nylas`


API Overview
------------

Every resource (i.e., messages, events, contacts) is accessed via an instance of `Nylas`. Before making any requests, be sure to call `config` and initialize the `Nylas` instance with your `clientId` and `clientSecret`. Then, call `with` and pass it your `accessToken`. The `accessToken` allows `Nylas` to make requests for a given account's resources.

```javascript
const Nylas = require('nylas');

Nylas.config({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});

const nylas = Nylas.with(ACCESS_TOKEN);
```

Every resource method accepts an optional callback as the last argument:

```javascript
nylas.threads.list({}, (err, threads) => {
  console.log(threads.length);
});
```

Additionally, every resource method returns a promise, so you don't have to use callbacks if your code is promise-friendly. Here's an example using promises:

```javascript
nylas.threads.list({}).then(threads => {
  console.log(threads.length);
});
```

And here's an example using async/await:

```javascript
const getThreadCount = async nylas => {
  const threads = await nylas.threads.list({});
  return threads.length;
};
```


Authentication
-----
The Nylas REST API uses server-side (three-legged) OAuth, and the Node.js bindings provide convenience methods that simplify the OAuth process. For more information about authenticating users with Nylas, visit the [API docs](https://nylas.com/docs/#authentication).

`urlForAuthentication()` takes in an `options` object, which must have a `redirectURI` property defined. Other supported, but optional, properties are:

* `loginHint` - The user's email address, if known.
* `state` - An arbitrary string that will be returned back as a query param in your `redirectURI`.
* `scopes` - An array of which scopes you'd like to auth with. The Nylas API provides granular authentication scopes that empower users with control over what level of access your application has to their data. See supported [Authentication Scopes](https://docs.nylas.com/docs/authentication-scopes) for a full list of scopes and details behind the scopes. If omitted, defaults to all scopes.

### Step 1: Redirect the user to Nylas

```javascript
const Nylas = require('nylas');

Nylas.config({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});

router.get('/connect', (req, res, next) => {
  options = {
    redirectURI: 'http://localhost:3000/oauth/callback',
    scopes: ['email.read_only', 'email.send'],
  };
  res.redirect(Nylas.urlForAuthentication(options));
});
```

### Step 2: Handle the Authentication Response

```javascript
router.get('/oauth/callback', (req, res, next) => {
  if (req.query.code) {
    Nylas.exchangeCodeForToken(req.query.code).then(token => {
      // save the token to the current session, save it to the user model, etc.
    });
  } else if (req.query.error) {
    res.render('error', {
      message: req.query.reason,
      error: {
        status:
          'Please try authenticating again or use a different email account.',
        stack: '',
      },
    });
  }
});
```

Getting IP Addresses to Whitelist
-----

To obtain a dynamic list of IP addresses that Nylas might use to connect.

```javascript
  const nylas = Nylas.with(ACCESS_TOKEN);
  // Get IP Addresses
  Nylas.accounts.first()
  .then(account => account.ipAddresses())
  .then(response => console.log(response));
```

Fetching Messages, Events, Contacts, etc.
-----

The Node.js SDK exposes API resources (threads, messages, folders, labels, files, events, contacts, etc.) as attributes of the `nylas` object. You can query these resources in several ways. Available filters can be found in the [API docs](https://www.nylas.com/docs/platform?node#filters).


```javascript
const nylas = Nylas.with(ACCESS_TOKEN);

// Find the first thread matching the filter criteria

nylas.threads.first({ from: EMAIL_ADDRESS }).then(thread => {
  console.log(thread.subject);
  console.log(thread.snippet);
});

// Count threads in inbox

nylas.threads.count({ in: 'inbox' }).then(count => {
  console.log(`There are ${count} threads in your inbox.`);
});

// Fetch a single thread

nylas.threads
  .find(THREAD_ID)
  .then(thread => {
    console.log(thread.subject);
  })
  .catch(err => {
    console.log(`Thread not found! Error: ${err.toString()}`);
  });

// Fetch a single thread (using optional callback instead of promise)

nylas.threads.find(THREAD_ID, (err, thread) => {
  if (err) {
    console.log(`Thread not found! Error: ${err.toString()}`);
    return;
  }
  console.log(thread.subject);
});

// Iterate over every matching thread. Automatically paginates the underlying API
// as necessary and calls the provided block as threads are received. Calls the final
// block upon an error, or when processing is finished.

nylas.threads.forEach(
  { unread: false, from: 'chaiskye@gmail.com' },
  thread => console.log(thread.subject),
  err => console.log('Finished iterating through threads.')
);

// Returns an array of all matching threads, paginating the underlying API as necessary.
// May take a long time and return many, many objects if used with a broad filter.

nylas.threads.list({ in: 'inbox' }).then(threads => {
  console.log(threads);
});

```

Folders and Labels
-----

The folders and labels API allows you to apply Gmail labels to whole threads or individual messages and, for providers other than Gmail, to move threads and messages between folders.

Note that folders and labels are identical from the standpoint of the SDK. The only difference is that a message can have many labels but only a single folder.

```javascript
const nylas = Nylas.with(ACCESS_TOKEN);

// List the labels for this account (Gmail)
nylas.labels.list({}).then(labels => {
  for (const label of labels) {
    console.log(label.displayName);
    console.log(label.id);
  }
});

// List the labels this account (Exchange or IMAP)
nylas.folders.list({}).then(folders => {
  for (const folder of folders) {
    console.log(folder.displayName);
    console.log(folder.id);
  }
});

// Create a folder (Exchange or IMAP)
const fld = nylas.folders.build({ displayName: 'Reminders' });
fld.save();

// Add the 'Spam' label to a thread (Gmail)
let spamLabel = undefined;
nylas.labels.list({}).then(labels => {
  for (const label of labels) {
    if (label.displayName == 'Spam') {
      spamLabel = label;
      break;
    }
  }

  nylas.threads.list({}, (err, threads) => {
    const thread = threads[0];
    thread.labels.push(spamLabel);
    thread.save();
    console.log(thread);
  });
});
```

File Metadata
-----

```javascript
const nylas = Nylas.with(ACCESS_TOKEN);

// Get the metadata of a particular file
const f = nylas.files.build({
  id: fileId,
});

f.metadata((err, data) => {
  console.log(data);
});

```

On success, the file metadata should look like:
```
{
  "content_type": "application/msword",
  "filename": "Reinstatement of Corporation.doc",
  "id": "9tm2n206vdj29wrhcxfvmvo4o",
  "message_ids": [
    "93mtrpk4uo3wsvwcpb5yh57kp"
  ],
  "account_id": "6aakaxzi4j5gn6f7kbb9e0fxs",
  "object": "file",
  "size": 100864
}
```

Uploading Files
-----
Because of a bug in the library we use to issue HTTP requests, we can't pass a stream to the file upload function, which is why we read the file directly.

```javascript
const fs = require('fs');

const nylas = Nylas.with(ACCESS_TOKEN);

fs.readFile(filePath, 'utf8', (err, data) => {
  f = nylas.files.build({
    filename: filePath,
    data: data,
    contentType: 'text/plain',
  });

  f.upload((err, file) => {
    // Create a draft and attach the file to it.
    const draft = nylas.drafts.build({
      subject: 'Ice Cream',
      to: [{ email: 'helena@nylas.com' }],
      body: 'Hey, find the file attached.',
    });

    draft.files = [file];

    draft.send().then(message => {
      console.log(`${message.id} was sent`);
    });
  });
});

```

Downloading Files
-----

```javascript
const fs = require('fs');

const nylas = Nylas.with(ACCESS_TOKEN);

const f = nylas.files.build({
  id: fileId,
});

f.download((err, file) => {
  // File contains headers like 'Content-Disposition',
  // and then the data is stored in 'body'
  fs.writeFile('/tmp/' + file.filename, file.body);
});

```

Creating and Sending Drafts
------
You can create, save, and send drafts. To send, first create a draft object with the correct fields (To/CC/BCC, subject, body, etc.), and then call `send`. When the draft is sent, the Nylas API will return a `Message` object.

If you want to send a reply, set `replyMessageId` to the ID of the message to which you're replying. When that field is set, the Nylas API will set email headers to mark your message as a reply.

```javascript
const nylas = Nylas.with(ACCESS_TOKEN);

const draft = nylas.drafts.build({
  subject: 'My New Draft',
  to: [{ email: 'ben@nylas.com' }],
  replyToMessageId: MESSAGE_ID,
});

// Enabling tracking
// NB: When passing in the tracking object, you *must* pass in a value for callback as the first parameter.

const tracking = {
  "links": true,
  "opens": true,
  "thread_replies": true,
  "payload": "12345"
}

// Sending the draft

draft.send(null, tracking).then(message => {
  console.log(`${message.id} was sent`);
});

// Saving a draft

draft.save().then(draft => {
  console.log(`${draft.id} was saved`);
});

// Retrieving and sending a saved draft

const savedId = '1234';

nylas.drafts
  .find(savedId)
  .then(draft => draft.send())
  .then(message => {
    console.log(`Sent ${message.subject}!`);
  });

```

Searching Threads and Messages
-----
You can run a full-text search on threads and messages using `search` and passing a string to query. By default, the Nylas API returns 40 results, but you can pass a `limit` and `offset` to perform pagination.

```javascript
const nylas = Nylas.with(ACCESS_TOKEN);

nylas.messages.search('Hey!').then(messages => console.log(messages));

```

Creating and Updating Webhooks
-----
You can programmatically create, read, update and delete webhooks.

```javascript
// create a new webhook
const newWebhook = Nylas.webhooks.build({
  callbackUrl: 'https://wwww.myapp.com/webhook',
  state: 'active',
  triggers: ['event.created', 'event.updated'],
  });
newWebhook.save().then(webhook => console.log(webhook.id));

// get and update the state of an existing webhook
// note: a webhook's callbackUrl & triggers are not updateable, only its state.
Nylas.webhooks.find('existingWebhookId').then(existingWebhook => {
  existingWebhook.state = 'active';
  existingWebhook.save();
})

// delete an existing webhook
Nylas.webhooks.delete(existingWebhook);

```

Using the Delta Streaming API
------

```javascript
const DELTA_EXCLUDE_TYPES = ['contact', 'calendar', 'event', 'file', 'tag'];
const nylas = Nylas.with(ACCESS_TOKEN);

nylas.deltas.latestCursor((error, cursor) => {
  // Save inital cursor.
  persistCursor(cursor);

  // Start the stream and add event handlers.
  const stream = nylas.deltas.startStream(cursor, DELTA_EXCLUDE_TYPES);

  stream
    .on('delta', delta => {
      // Handle the new delta.
      console.log('Received delta:', delta);
      // Save new cursor so this delta doesn't need to be re-fetched for future streams.
      persistCursor(delta.cursor);
    })
    .on('error', err => {
      // Handle errors here, such as by restarting the stream at the last cursor.
      console.error('Delta streaming error:', err);
    });

  // Closing the stream explicitly, if needed
  stopButton.addEventListener('click', () => {
    stream.close();
  });
});
```

Interacting with Events
----
You can send calendar invites to events using the Nylas API. To send invites and updates to the event's participants, set `notify_participants` to `true`.

```javascript
const nylas = Nylas.with(ACCESS_TOKEN);

const event = nylas.events.build({
  title: 'Out of time',
  calendarId: CALENDAR_ID,
  when: { start_time: 1437500000, end_time: 1437501600 },
  participants: [{ email: 'helena@nylas.com', name: 'Helena Handbasket' }],
});

event.save({ notify_participants: true }).then(event => {
  console.log(event);
  console.log('Sent an invite to the participants');
});

// RSVP to an invite. Note that you can only RSVP to invites found in the
// "Emailed events" calendar.
nylas.events
  .find(EVENT_ID)
  .then(event => event.rsvp('maybe', 'I may attend this event'))
  .then(event => console.log('RSVP sent!'));
```

Sending and Retrieving Raw MIME
-----
To send raw MIME, you can build a draft and, instead of providing the normal fields, pass the MIME in an object as `rawMime`.

To retrieve the raw MIME for an account's message, call `getRaw` on the message object, and the MIME will be returned in a promise.

```javascript
const nylas = Nylas.with(ACCESS_TOKEN);

// Send a message with raw MIME
const draft = nylas.drafts.build({ rawMime }); // rawMIME should be a MIME-format string with headers and multipart message
draft.send().then(message => console.log(message));

// Retrieve raw MIME for a message
nylas.messages
  .first()
  .then(message => message.getRaw())
  .then(rawMessage => console.log(rawMessage));

```

Accounts
----

It's possible to get details about the account you're accessing by using the `account` method:

```javascript
const nylas = Nylas.with(ACCESS_TOKEN);

nylas.account.get().then(account => console.log(account));

```

You can access the billing status and cancel/reactivate an account for the accounts in your app by using the `accounts` method:

```javascript
// Show all billing statuses for accounts
Nylas.accounts.list().then(accounts => {
  console.log(accounts.length);
  for (const account of accounts) {
    console.log(
      account.id,
      account.billingState,
      account.syncState
    );
  }
});

// Cancel the first account
Nylas.accounts
  .first()
  .then(account => account.downgrade())
  .then(response => console.log(response));

// Reactivate an account
Nylas.accounts
  .first()
  .then(account => account.upgrade())
  .then(response => console.log(response));

// Revoke all tokens or all but one token for an account
Nylas.accounts
  .first()
  .then(account => account.revokeAll('kept_access_token'))
  .then(response => console.log(response));
```

Open-Source API
----

The [Nylas Sync Engine](http://github.com/nylas/sync-engine) is open-source, and you can also use the Node.js SDK with the open-source API. Since the open-source API provides no authentication or security, connecting to it is simple.

It requires us to "auth" to it by passing the account id as an auth token. Here's an example of fetching the messages of the first account after getting the account ID:

```javascript
const Nylas = require('nylas');

Nylas.config({
  clientId: 'clientId', // Doesn't matter when running locally
  clientSecret: 'clientSecret', // Doesn't matter when running locally
  apiServer: 'http://localhost:5555',
});

/* The open source version of the engine requires us to "auth" to it by
   passing the account id as an auth token. Get the account id of the
   first account.
*/
Nylas.accounts.first().then(account => {
  const nylas = Nylas.with(account.id).messages.list(
    { limit: 20 },
    (err, messages) => {
      for (const message of messages) {
        console.log(message.subject);
      }
    }
  );
});
```

Example Apps
----

We have a few example Express apps in the `example` directory that show examples for authentication and webhooks. You can run them to see how they're implemented:

`npm install` or `yarn`

`npm start` or `yarn start`

Note that you'll need to replace the Nylas app ID and app secret in `app.js` or create a `config.js` file with your application's credentials.


Contributing
----

We'd love your help making the Nylas Node.js SDK better. Come chat in the [Nylas community Slack channel](http://slack-invite.nylas.com/) or email support@nylas.com.

Please sign the [Contributor License Agreement](https://goo.gl/forms/lKbET6S6iWsGoBbz2) before submitting pull requests. (It's similar to other projects, like NodeJS or Meteor.)

Tests can be run with:

`npm test`

Our linter can be run with:

`npm run lint`

To use the package during local development, symlink the directory:

`npm link` in the `nylas-nodejs` directory
`npm link nylas` in the directory with your code that uses the package
