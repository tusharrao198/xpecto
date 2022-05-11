const router = require("express").Router();

const {
	findEvent,
	findWebinar,
	findWorkshop,
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

router.get("/workshops", async (req, res) => {
	let workTable = require("../models/workshop");
	const allWorkshops = await workTable.find({}).lean();
	const checker = isRegistered(req.user, allWorkshops);
	res.render("workshops", {
		workshops: allWorkshops,
		authenticated: req.isAuthenticated(),
		user: req.user,
		checker: checker,
	});
});

router.get("/workshopRegister", authCheck, async (req, res) => {
	const workshop = await findWorkshop(req);
	const workshopTable = require("../models/workshop");

	if (workshop) {
		const checker = isRegisteredforEvent(req.user, workshop);
		if (!checker) {
			await workshopTable.updateOne(
				{ _id: workshop._id },
				{ $push: { registeredUsers: { user_id: req.user._id } } }
			);
		} else {
			console.log("Can register only once");
		}
	}
	res.redirect(`/workshops`);
});

module.exports = router;
