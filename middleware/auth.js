module.exports = {
    authCheck: function (req, res, next) {
        if (!req.user) {
            res.redirect("/auth/google");
        } else {
            req.session.user = req.user;
            return next();
        }
    },
};
