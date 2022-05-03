module.exports = {
    authCheck: function (req, res, next) {
        if (!req.user) {
            req.session.returnTo = req.originalUrl;
            res.redirect("/auth/google");
        } else {
            req.session.user = req.user;
<<<<<<< HEAD
=======
            req.session.returnTo = req.originalUrl;
>>>>>>> 7fc048106335556a9f9d950731fa413fe377e678
            return next();
        }
    },
};
