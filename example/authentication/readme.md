# Nylas Connect

This tiny [Express](https://expressjs.com/) app is a simple example of how to
use Nylas' [Native authentication
APIs](https://www.nylas.com/docs/platform#native_authentication).  You can
connect both Exchange accounts and Gmail account's in this example.

It shows how to receive a `refresh_token` from Google before authenticating with
Nylas. Then it uses the Nylas Ruby SDK to connect an email account and load the
user's latest email.

While this steps through the Google OAuth flow manually, you can alternatively
use Google API SDKs for node and many other languages. Learn more about that
[here](https://developers.google.com/api-client-library/python/). You can also
learn more about Google OAuth
[here](https://developers.google.com/identity/protocols/OAuth2WebServer).

Here is an overview of the complete flow when connecting a Google account.

```
Your App                                    Google
+------+                                    +-----+
|      |  Redirect user to Oauth Login      |     |
|      +----------------------------------> |     |
|      |                                    |     |
|      |      Authorization code            |     |
|      | <--(localhost)-<-------------------+     |
|      |                                    |     |
|      |      Request refresh token         |     |
|      +----------------------------------> |     |
|      |                                    |     |
|      |     Refresh & access token         |     |
|      | <----------------------------------+     |
|      |                                    +-----+
|      |
|      |
|      |                                    Nylas
|      |     Request Authorization code     +-----+
|      +----------------------------------> |     |
|      |                                    |     |
|      |      Authorization code            |     |
|      | <----------------------------------+     |
|      |                                    |     |
|      |      Request Access Token          |     |
|      +----------------------------------> |     |
|      |                                    |     |
|      |      Access Token                  |     |
|      | <----------------------------------+     |
+------+                                    +-----+
```

# Getting Started

## Dependencies

### Google Application

You'll need to have a Nylas [developer account](https://developer.nylas.com), a
Google Application (if you'd like to connect Google accounts), and the
respective `client_id` and `client_secret`s.  Learn about how to setup the
Google App to correctly work with Nylas
[here](https://support.nylas.com/hc/en-us/articles/222176307-Google-OAuth-Setup-Guide).

## Initial Setup

Add your google and nylas client id's and secrets to a new file `config.js`.
See `config.js.template` for an example.

Then install dependencies with:
```
npm install
```

# Running the app

Run the express app.

```bash
npm start
```

Visit http://localhost:3000 in your browser.
