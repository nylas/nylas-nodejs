console.log("")
console.log("      _   _       _")
console.log("     | \ | |     | |")
console.log("     |  \| |_   _| | __ _ ___")
console.log("     | . ` | | | | |/ _` / __|")
console.log("     | |\  | |_| | | (_| \__ \\")
console.log("     \_| \_/\__, |_|\__,_|___/")
console.log("             __/ |")
console.log("            |___/")
console.log("")
console.log("      A P I  S E L F - T E S T")
console.log("")
console.log("\n\n")
console.log("Hiya! Welcome to the Node SDK test program. I need your help to make sure we didn't break the SDK.")
console.log("")
console.log("Could you confirm that the following API functions didn't break?")

credentials = require('./credentials.js');
AUTH_TOKEN = credentials.AUTH_TOKEN
DEST_EMAIL = credentials.DEST_EMAIL

function color_display(s) {
    console.log("\033[31m" + s + "\033[0m")
}

var Nylas = require('nylas').config({
    appId: 'blah',
    appSecret: 'blah',
    apiServer: 'https://api-staging.nylas.com/'
});

var nylas = Nylas.with(AUTH_TOKEN)

nylas.threads.list({}).then(function(threads){
    color_display("Number of threads: " + threads.length);
    color_display("Here's at most 10 thread subjects");
    for(var i = 0; i < threads.length; i++) {
        console.log(threads[i].subject);
        if (i == 10)
            break;
    }
});

nylas.threads.list({'in': 'sent'}).then(function(threads){
    color_display("Here's at most 10 thread subjects from the sent folder");
    for(var i = 0; i < threads.length; i++) {
        console.log(threads[i].subject);
        if (i == 10)
            break;
    }
});

var draft = nylas.drafts.build({
    subject: 'Nylas node test draft',
    to: [{email: DEST_EMAIL}]
});

// Sending the Draft
draft.send().then(function(draft) {
    color_display('Sent you an email. Check your inbox.')
});

// List the labels for this account
nylas.labels.list({}).then(function(labels) {
    color_display('Listing labels -- 10 at most');

    for(var i = 0; i < labels.length; i++) {
        var label = labels[i];
        console.log(label.displayName);
        if (i == 9)
            break;
    }

})

// The same, with folders.
nylas.folders.list({}).then(function(folders) {
    color_display('Listing folders -- 10 at most');

    for(var i = 0; i < folders.length; i++) {
        var folder = folders[i];
        console.log(folder.displayName);
        if (i == 9)
            break;
    }

    // Create a folder
    color_display('Creating a folder');
    date = new Date();
    fld = nylas.folders.build({ displayName: date.toString(), name: date.toString});
    fld.save();


})

var DELTA_EXCLUDE_TYPES = ['contact', 'calendar', 'event', 'file', 'tag'];
var timestampMs = Date.now();

nylas.deltas.generateCursor(timestampMs, function(error, cursor) {
  var stream = nylas.deltas.startStream(cursor, DELTA_EXCLUDE_TYPES);

  color_display('Started delta stream --- try sending a new message and see if it appears here. You may have to use Ctrl-C to quit though.');
  stream.on('delta', function(delta) {
    // Handle the new delta here.
    // Save new cursor so this delta doesn't need to be re-fetched for future streams.
    console.log("delta: " + delta.cursor);
  }).on('error', function(err) {
    // Handle errors here, such as by restarting the stream at the last cursor.
    console.error('Delta streaming error:', err);

  });

});

nylas.calendars.list({}).then(function(calendars) {
    cal = null;
    for(var i = 0; i < calendars.length; i++) {
        if (calendars[i].readOnly != true) {
            cal = calendars[i];
            break;
        }
    }

    nylas.events.list({}).then(function(events) {
        ev = nylas.events.build({title: 'Test node event', start: Math.floor(Date.now() / 1000), end: Math.floor((Date.now() + 20000) / 1000)});
        ev.calendarId = cal.id;
        color_display('Creating an event');
        ev.save(function() {
            nylas.events.list({}).then(function(events) {

                for(var i = 0; i < events.length; i++) {
                    ev2 = events[i];
                    if (ev2.start == ev.start) {
                        color_display('Found the event!');
                    }
                }
            });
        });
    });

})

