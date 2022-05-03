module.exports = {
    authCheck: function (req, res, next) {
        if (!req.user) {
            req.session.returnTo = req.originalUrl;
            res.redirect("/auth/google");
        } else {
            req.session.user = req.user;
            req.session.returnTo = req.originalUrl;
            return next();
        }
    },
    adminCheck: function (req, res, next) {
        if (req.session.admin == "0") {
            req.session.returnTo = req.originalUrl;
            res.redirect("/adminlogin");
        } else {
            req.session.admin = "1";
            req.session.returnTo = req.originalUrl;
            return next();
        }
    },
};
