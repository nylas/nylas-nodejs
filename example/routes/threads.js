var express = require('express');
var router = express.Router();

router.get('/top', function (req, res, next) {
    Nilas.with(req.query.token).namespaces.first().then(function(namespace){
        namespace.threads.first({}, function(err, thread) {
            res.render('thread', {
                thread: thread
            });
        });

        // namespace.threads.list({from: 'ben@nilas.com'}).then(function(threads) {
        //     console.log(threads.length);
        // });

        // namespace.threads.count({from: 'ben@nilas.com'}).then(function(count) {
        //     console.log(count);
        // });

        // namespace.threads.first({from: 'ben@nilas.com'}).then(function(thread) {
        //     console.log(thread.id);
        // });

        // namespace.threads.find('eaw54pwxa2deifmpeuedgfrxc').then(function(thread) {
        //     console.log(thread.subject);
        // });

        // var draft = namespace.drafts.build({
        //     subject: 'My New Draft',
        //     to: [{email: 'ben@nilas.com'}]
        // }).send().then(function(draft) {
        //     console.log(draft.id + ' was sent');
        // });
    });
})


module.exports = router;
