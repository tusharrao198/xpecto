const router = require("express").Router();
const passport = require("passport");

// auth login
router.get("/login", (req, res) => {
    res.render("login", {
        authenticated: req.isAuthenticated(),
        user: req.session.user,
    });
});

// auth logout
router.get("/logout", (req, res) => {
    // req.session = null;
    req.logout();
    req.session.user = null;
    req.session.admin = null;
    if (req.session.returnTo === undefined || req.session.returnTo === null) {
        delete req.session.returnTo;
    }
    res.redirect("/");
});

// auth with google+
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/error" }),
    function (req, res) {
        // console.log('req.user') // user info
        // Successful authentication, redirect success.
        if (process.env.NODE_ENV == "development") {
            // console.log("dev = ", req.headers.host);
            // console.log("dev url = ", req.url);
            res.redirect(req.session.returnTo || "/");
            delete req.session.returnTo;
            // res.redirect("/");
        } else if (process.env.NODE_ENV == "production") {
            // res.redirect(`https://${req.headers.host}/`);

            res.redirect(
                req.session.returnTo || `https://${req.headers.host}/`
            );
            delete req.session.returnTo;
        } else {
            res.redirect(req.session.returnTo || "/");
            delete req.session.returnTo;
        }
    }
);

module.exports = router;
