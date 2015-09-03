var Nylas = require('nylas').config({
    appId: 'blah',
    appSecret: 'blah',
    apiServer: 'https://api-staging.nylas.com/'
});

credentials = require('./credentials.js');
AUTH_TOKEN = credentials.AUTH_TOKEN
DEST_EMAIL = credentials.DEST_EMAIL

var nylas = Nylas.with(AUTH_TOKEN)

var timestampMs = Date.now();

nylas.deltas.generateCursor(timestampMs, function(error, cursor) {
  var stream = nylas.deltas.startStream(cursor);

  console.log('Started delta stream --- try sending a new message and see if it appears here. You may have to use Ctrl-C to quit though.');
  stream.on('delta', function(delta) {
    // Handle the new delta here.
    // Save new cursor so this delta doesn't need to be re-fetched for future streams.
    console.log("delta: " + delta.cursor);
  }).on('error', function(err) {
    // Handle errors here, such as by restarting the stream at the last cursor.
    console.error('Delta streaming error:', err);

  });

});


