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
		console.log("inside adminCheck", req.session.admin);
		if (req.session.admin == "1") {
			// req.session.admin = "1";
			req.session.returnTo = req.originalUrl;
			return next();
		} else {
			req.session.returnTo = req.originalUrl;
			res.redirect("/adminlogin");
		}
	},
	eventCoordiCheck: function (req, res, next) {
		console.log("inside eventCoordiCheck", req.session.iseventcoord);
		if (req.session.iseventcoord == "1") {
			// req.session.admin = "1";
			req.session.returnTo = req.originalUrl;
			return next();
		} else {
			req.session.returnTo = req.originalUrl;
			res.redirect("/adminlogin");
		}
	},
};
