module.exports = {
    authCheck: function (req, res, next) {
        if (!req.user) {
            res.redirect("/auth/login");
        } else {
            return next();
        }
    },
};
