'use strict';
const express = require('express');
const crypto = require('crypto');
const request = require('request');
// Import secret and other configuration
const config = require('./config');

const app = express();

const bodyParser = require('body-parser');

// Custom Middleware to compute rawBody. Unfortunately using
// JSON.stringify(req.body) will remove spaces and newlines, so verification
// will fail. We must add this middleware to ensure we're computing the correct
// signature
app.use(function(req, res, next){
    req.rawBody = '';
    req.on('data', function(chunk){
        req.rawBody += chunk;
    });
    next();
});
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/webhook', function(req, res) {
  // Nylas will check to make sure your webhook is valid by making a GET
  // request to your endpoint with a challenge parameter when you add the
  // endpoint to the developer dashboard.  All you have to do is return the
  // value of the challenge parameter in the body of the response.
  return res.status(200).send(req.query.challenge);
});

app.post('/webhook', function(req, res) {
  // Verify the request to make sure it's actually from Nylas.
  if (!verify_nylas_request(req)) {
    console.log("Failed to verify nylas");
    return res.status(401).send("X-Nylas-Signature failed verification 🚷 ");
  }

  // Nylas sent us a webhook notification for some kind of event, so we should
  // process it!
  let data = req.body.deltas;
  for (var i = 0; i < data.length; i++) {
    // Print some of the information Nylas sent us. This is where you
    // would normally process the webhook notification and do things like
    // fetch relevant message ids, update your database, etc.
    console.log("%s at %s with id %s", data[i].type, data[i].date, data[i].object_data.id);
  }
  // Don't forget to let Nylas know that everything was pretty ok.
  return res.status(200);
});

// Each request made by Nylas includes an X-Nylas-Signature header. The header
// contains the HMAC-SHA256 signature of the request body, using your client
// secret as the signing key. This allows your app to verify that the
// notification really came from Nylas.
function verify_nylas_request(req) {
  let digest = crypto.createHmac('sha256', config.nylasClientSecret)
                   .update(req.rawBody)
                   .digest('hex');
  return digest === req.get('x-nylas-signature')
}

var webhook_uri;
// Setup ngrok settings to ensure everything works locally 
request('http://localhost:4040/api/tunnels', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    webhook_uri = JSON.parse(body).tunnels[1].public_url + "/webhook";
  }
  else {
    throw "It looks like ngrok isn't running! Make sure you've started that first with 'ngrok http 1234'";
  }
  if (config.nylasClientSecret === '') {
    throw "You need to add your Nylas client secret to config.js first!"
  }
  // Start the program
  console.log('\n%s\n\nAdd the above url to the webhooks page at https://developer.nylas.com', webhook_uri);
  console.log(`Server running at http://${config.host}:${config.port}/`);
  app.listen(config.port);
});
