module.exports = {
    authCheck: function (req, res, next) {
        if (!req.user) {
            res.redirect("/");
        } else {
            return next();
        }
    },
};
