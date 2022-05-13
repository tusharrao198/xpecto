const router = require("express").Router();
const {
	findEvent,
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

router.get("/profile", authCheck, async (req, res) => {
	const context = await allEventDetails(req);
	res.render("profile", {
		user: req.user,
		authenticated: req.isAuthenticated(),
		context: context,
	});
});

router.get("/ourteam", async (req, res) => {
	const coreTeamTable = require("../models/coreTeam");
	let members = await coreTeamTable.find().lean();
	res.render("team", {
		authenticated: req.isAuthenticated(),
		members: members,
	});
});

router.get("/terms", (req, res) => {
	res.render("terms", {
		authenticated: req.isAuthenticated(),
	});
});

router.get("/privacy", (req, res) => {
	res.render("privacy", {
		authenticated: req.isAuthenticated(),
	});
});

router.get("/timeline", async (req, res) => {
	const timeline = require("../models/timeline");
	let schedule = await timeline.find().lean();
	res.render("timeline", {
		authenticated: req.isAuthenticated(),
		user: req.session.user,
		schedule: schedule,
		dates: ["13th May", "14th May", "15th May", "16th May"],
	});
});

module.exports = router;
