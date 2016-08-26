var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    options = {
        redirectURI: 'http://localhost:3000/oauth/callback',
        trial: false
    }
    res.render('index', {
        title: 'Welcome',
        message: 'Link your email to get started.',
        url: Nylas.urlForAuthentication(options)
    });
});

router.get('/oauth/callback', function (req, res, next) {
    if (req.query.code) {
        Nylas.exchangeCodeForToken(req.query.code).then(function(token) {
            res.redirect("/threads/top?token="+token);
        });

    } else if (req.query.error) {
        res.render('error', {
            message: req.query.reason,
            error: {
                status: 'Please try authenticating again or use a different email account.',
                stack: ''
            }
        });
    }
});

module.exports = router;
