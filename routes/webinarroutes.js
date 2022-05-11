const router = require("express").Router();

const {
	findEvent,
	findWebinar,
	findEventFromId,
	findUserTeam,
	findUserTeamFromId,
	createNewTeam,
	joinTeam,
	deleteTeam,
	removeMember,
	deleteOldInviteCode,
	createNewInviteCode,
	allEventDetails,
	userDetails,
	regCheck,
	allowRegistration,
	maxteamSize,
	checkTeamName,
	saveReferralCode,
	generateString,
	homepageInfo,
	sponsorsInfo,
	FAQInfo,
	registrationdifferentiate,
	numberofReg_referCode,
	isRegistered,
	isRegisteredforEvent,
} = require("../utils");
var url = require("url");
const { authCheck, adminCheck } = require("../middleware/auth");
const upload = require("../multer.js");
const code = require("../models/code");

router.get("/webinars", async (req, res) => {
	let webinarTable = require("../models/webinar");
	const allwebinars = await webinarTable.find({}).lean();
	const checker = isRegistered(req.user, allwebinars);
	res.render("webinars", {
		webinars: allwebinars,
		authenticated: req.isAuthenticated(),
		user: req.user,
		checker: checker,
	});
});

router.get("/webinarRegister", authCheck, async (req, res) => {
	const webinar = await findWebinar(req);
	const webinarTable = require("../models/webinar");

	if (webinar) {
		const checker = isRegisteredforEvent(req.user, webinar);
		if (!checker) {
			await webinarTable.updateOne(
				{ _id: webinar._id },
				{ $push: { registeredUsers: { user_id: req.user._id } } }
			);
		} else {
			console.log("Can register only once");
		}
	}
	res.redirect(`/webinar?webinar=${webinar.name}`);
});

router.get("/webinar", authCheck, async (req, res) => {
	const webinar = await findWebinar(req);
	const checker = isRegisteredforEvent(req.user, webinar);
	// console.log("checke webinar = ", checker, "\n", webinar);

	const context = {
		webinar: webinar,
		authenticated: req.isAuthenticated(),
		user: req.session.user,
		checker: checker,
	};
	res.render("webinar", context);
});

module.exports = router;
