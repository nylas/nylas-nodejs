var express = require('express');
var router = express.Router();

router.get('/top', function (req, res, next) {

    var nylas = Nylas.with(req.query.token);
    nylas.threads.first().then(function(thread) {
      res.render('thread', {
          thread: thread

    });
  });
});


module.exports = router;
