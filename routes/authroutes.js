const router = require("express").Router();
const passport = require("passport");
const mcache = require("memory-cache");

// auth login
router.get("/login", (req, res) => {
    res.render("login", { authenticated: req.isAuthenticated(),user: req.session.user });
});

var cache = (dur)=>{
    return (req,res,next)=>{
        let key = '__express__'+req.originalURL||req.url
        let cachedBody = mcache.get(key)
        if(cachedBody){
            window.location.reload();
            res.send(cachedBody)
            return
        }else{
            res.sendResponse = res.send
            res.send = (body) => {
                mcache.put(key, body, duration*1000);
                res.sendResponse(body)
            }
            next()
        }
    }
}
// auth logout
router.get("/logout", (req, res) => {
    // req.session = null;
    setTimeout(()=>{
        req.logout();
        res.redirect("/");
    },1000);
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
            console.log("dev = ", req.headers.host);
            // console.log("dev url = ", req.url);
            res.redirect("/profile");
        } else if (process.env.NODE_ENV == "production") {
            res.redirect(`https://${req.headers.host}/profile`);
        } else {
            res.redirect("/profile");
        }
    }
);

module.exports = router;
