const router = require('express').Router();
const passport = require('passport');

// auth login
router.get('/login', (req, res) => {
    res.render('login');
});

// auth logout
router.get('/logout', (req, res) => {
    // req.session = null;    
    req.logout();
    res.redirect('/');
});

// auth with google+
router.get('/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/error' }),
    function(req, res) {
        // console.log('req.user')
        // Successful authentication, redirect success.
        res.redirect('/success');
});

module.exports = router;