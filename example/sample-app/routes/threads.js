var express = require('express');
var router = express.Router();

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

router.get('/list', function(req, res, next) {
  var nylas = Nylas.with(req.session.token);
  nylas.threads.list({ limit: 10 }).then(function(threadList) {
    res.render('threadList', {
      threads: threadList,
    });
  });
});

module.exports = router;
