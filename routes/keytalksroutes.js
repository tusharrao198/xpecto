const router = require("express").Router();

const {
	findEvent,
	findKeyTalk,
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

router.get("/keytalks", async (req, res) => {
	let keytalkTable = require("../models/keytalks");
	const allkeytalks = await keytalkTable.find({}).lean();
	const checker = isRegistered(req.user, allkeytalks);
	res.render("keytalks", {
		keytalks: allkeytalks,
		authenticated: req.isAuthenticated(),
		user: req.user,
		checker: checker,
	});
});

router.get("/keytalkRegister", authCheck, async (req, res) => {
	const keytalk = await findKeyTalk(req);
	const keytalkTable = require("../models/keytalks");

	if (keytalk) {
		const checker = isRegisteredforEvent(req.user, keytalk);
		if (!checker) {
			await keytalkTable.updateOne(
				{ _id: keytalk._id },
				{ $push: { registeredUsers: { user_id: req.user._id } } }
			);
		} else {
			console.log("Can register only once");
		}
	}
	res.redirect(`/keytalk?keytalk=${keytalk.name}`);
});

router.get("/keytalk", authCheck, async (req, res) => {
	const keytalk = await findKeyTalk(req);
	const checker = isRegisteredforEvent(req.user, keytalk);
	// console.log("checke keytalk = ", checker, "\n", keytalk);
	if (keytalk) {
		const context = {
			keytalk: keytalk,
			authenticated: req.isAuthenticated(),
			user: req.session.user,
			checker: checker,
		};
		res.render("keytalk", context);
	} else {
		res.redirect("/keytalks");
	}
});

module.exports = router;
