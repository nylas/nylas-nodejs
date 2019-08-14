const config = require('./config');
const request = require('request-promise');
const url = require('url');

if (config.nylasClientSecret === '' || config.nylasClientId === '') {
  throw 'You need to add your Nylas client secret to config.js first!';
}

// setup the Nylas API
global.Nylas = require('nylas').config({
  clientId: config.nylasClientId,
  clientSecret: config.nylasClientSecret,
});

// First POST to /connect/authorize to get an authorization code from Nylas
// Then post to /connect/token to get an access_token that can be used to access
// account data
function connectToNylas(data) {
  return nylasCode(data)
    .then(code => {
      const params = {
        client_id: config.nylasClientId,
        client_secret: config.nylasClientSecret,
        code: code,
      };
      return nylasToken(params)
        .then(token => {
          return Promise.resolve(token);
        })
        .catch(err => {
          return Promise.reject(
            new Error(`Could not connect to Nylas. Error: ${err.message}`)
          );
        });
    })
    .catch(err => {
      return Promise.reject(
        new Error(`Could not connect to Nylas. Error: ${err.message}`)
      );
    });
}
module.exports.connectToNylas = connectToNylas;

function nylasCode(data) {
  const connect_uri = config.nylasApi + '/connect/authorize';
  return request
    .post({ url: connect_uri, json: data })
    .then(body => {
      return Promise.resolve(body.code);
    })
    .catch(err => {
      return Promise.reject(
        new Error(`Could not fetch Nylas code: ${err.message}`)
      );
    });
}

function nylasToken(data) {
  const token_uri = config.nylasApi + '/connect/token';
  return request
    .post({ url: token_uri, json: data })
    .then(body => {
      return Promise.resolve(body.access_token);
    })
    .catch(err => {
      return Promise.reject(
        new Error(`Could not fetch Nylas access token: ${err.message}`)
      );
    });
}

config.redirect_uri = 'http://localhost:3000/google/oauth2callback';
