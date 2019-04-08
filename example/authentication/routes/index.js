const express = require('express');
const router = express.Router();
const path = require('path');
const querystring = require('querystring');
const request = require('request-promise');
const config = require('../config');
const auth = require('../auth');

// These are the permissions your app will ask the user to approve for access
// https://developers.google.com/identity/protocols/OAuth2WebServer#scope
const GOOGLE_SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar',
  'https://www.google.com/m8/feeds/',
].join(' ');

// This is the path in your Google application that users are redirected to after
// they have authenticated with Google, and it must be authorized through
// Google's developer console
const GOOGLE_OAUTH_TOKEN_VALIDATION_URL =
  'https://www.googleapis.com/oauth2/v2/tokeninfo';
const GOOGLE_OAUTH_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_OAUTH_ACCESS_TOKEN_URL =
  'https://www.googleapis.com/oauth2/v4/token';

function get_email_from_access_token(google_access_token) {
  const data = {
    access_token: google_access_token,
    fields: ['email'],
  };
  return request
    .post({ url: GOOGLE_OAUTH_TOKEN_VALIDATION_URL, form: data })
    .then(body => {
      return Promise.resolve(JSON.parse(body).email);
    })
    .catch(err => {
      return Promise.reject(`Error validating Google token: ${err.message}`);
    });
}

// This is the url Google will call once a user has approved access to their
// account
router.get('/google/oauth2callback', function(req, res, next) {
  if (!req.query.code) {
    const data = {
      response_type: 'code',
      access_type: 'offline',
      client_id: config.googleClientId,
      redirect_uri: config.redirect_uri,
      scope: GOOGLE_SCOPES,
      // Note: this is only for testing to ensure a refresh token is
      // passed everytime, but requires the user to approve offline
      // access every time. You should remove this if you don't want
      // your user to have to approve access each time they connect
      prompt: 'consent',
    };
    const auth_uri = GOOGLE_OAUTH_AUTH_URL + '?' + querystring.stringify(data);
    res.redirect(auth_uri);
  } else {
    // The user just successfully authenticated with Google and was redirected
    // back here with a Google code
    const auth_code = req.query.code;
    const data = {
      code: auth_code,
      client_id: config.googleClientId,
      client_secret: config.googleClientSecret,
      redirect_uri: config.redirect_uri,
      grant_type: 'authorization_code',
    };

    // Using Google's authorization code we can get an access and refresh token
    const options = {
      uri: GOOGLE_OAUTH_ACCESS_TOKEN_URL,
      method: 'POST',
      form: data,
    };

    request(options)
      .then(body => {
        json = JSON.parse(body);
        req.session.google_refresh_token = json.refresh_token;
        req.session.google_access_token = json.access_token;
        res.redirect('/google');
      })
      .catch(err => {
        console.log(`Error getting refresh token: ${err.message}`);
      });
  }
});

router.get('/google', function(req, res, next) {
  // User hasn't authorized with google yet, so we should redirect
  if (!req.session.google_access_token) {
    res.redirect('/google/oauth2callback');
  }

  // The user has authorized with google at this point but we will need to
  // connect the account to Nylas
  if (!req.session.nylas_access_token) {
    const google_access_token = req.session.google_access_token;
    get_email_from_access_token(google_access_token)
      .then(email => {
        const google_refresh_token = req.session.google_refresh_token;
        const google_settings = {
          google_client_id: config.googleClientId,
          google_client_secret: config.googleClientSecret,
          google_refresh_token: google_refresh_token,
        };
        const data = {
          client_id: config.nylasClientId,
          name: 'Your Name',
          email_address: email,
          provider: 'gmail',
          settings: google_settings,
        };
        auth
          .connectToNylas(data)
          .then(token => {
            // User has succesfully authorized with google and connected to Nylas. Redirect
            // to homepage so we can show some emails!
            req.session.nylas_access_token = token;
            res.redirect('/');
          })
          .catch(err => {
            console.log(err);
            res.redirect('/google/oauth2callback');
          });
      })
      .catch(err => {
        console.log(err);
        res.redirect('/google');
      });
  }
});

router.post('/exchange', function(req, res, next) {
  // User gave us their username and password and submitted the form. Use the
  // data now to login with Nylas
  if (!req.session.nylas_access_token) {
    const json = req.body;
    const exchange_settings = {
      username: json.email,
      password: json.password,
    };
    const data = {
      client_id: config.nylasClientId,
      name: json.name,
      email_address: json.email,
      provider: 'exchange',
      settings: exchange_settings,
    };
    auth.connectToNylas(data).then(token => {
      req.session.nylas_access_token = token;
      res.redirect('/');
    });
  }
});

router.get('/exchange', function(req, res, next) {
  // Show a login form for a user to enter their information
  res.sendFile(path.join(__dirname + '/../views/exchange_login.html'));
});

router.get('/choose-login', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/../views/choose_login.html'));
});

router.get('/logout', function(req, res, next) {
  req.session.destroy();
  res.redirect('/');
});

router.get('/get-message', function(req, res, next) {
  // Account has been setup, let's use Nylas' Node SDK to retrieve an email
  const nylas = Nylas.with(req.session.nylas_access_token);

  // Find the first message matching the filter criteria
  nylas.messages.first().then(function(message) {
    res.send(message.body);
  });
});

router.get('/', function(req, res, next) {
  if (!req.session.nylas_access_token) {
    // If the user hasn't connected their email account from any provider, send
    // them to a login page that will allow them to connect any kind of account
    return res.redirect('/choose-login');
  }

  res.sendFile(path.join(__dirname + '/../views/authed_account.html'));
});

module.exports = router;
