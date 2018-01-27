var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('dashboard', {
    title: 'Your account has been linked!',
    message:
      'Click the links below to test out some Nylas features for threads!',
  });
});

module.exports = router;
