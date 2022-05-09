const router = require("express").Router();

const {
	findEvent,
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

router.get("/event", authCheck, async (req, res) => {
	const event = await findEvent(req);
	const checker = isRegisteredforEvent(req.user, event);
	const team = await findUserTeam(req);
	// console.log("checke event = ", checker);
	const context = {
		event: event,
		isRegisteredforEvent: checker.toString(),
		firstPrizeAmount: event.prices.first,
		team: team,
		authenticated: req.isAuthenticated(),
		team_created: team != null ? "true" : "false",
		isEventLive: event ? event.live.toString() : "false",
	};
	res.render("event", { ...context, user: req.session.user });
});

router.get("/events", async (req, res) => {
	let eventTable = require("../models/Events");
	const allEvents = await eventTable.find({}).lean();
	const checker = isRegistered(req.user, allEvents);
	res.render("events", {
		events: allEvents,
		authenticated: req.isAuthenticated(),
		user: req.user,
		checker: checker,
	});
});
router.get("/workshops", async (req, res) => {
	let workTable = require("../models/workshop");
	const allWorkshops = await workTable.find({}).lean();
	const checker = isRegistered(req.user, allWorkshops);
	res.render("workshops", {
		events: allWorkshops,
		authenticated: req.isAuthenticated(),
		user: req.user,
		checker: checker,
	});
});
router.get("/workshopRegister", async (req, res) => {
	const workshop = await findWorkshop(req);
	const workshopTable = require("../models/workshop");

	await workshopTable.updateOne(
		{ _id: workshop._id },
		{ $push: { registeredUsers: { user_id: req.user._id } } }
	);
	res.redirect(`/workshops`);
});

router.get("/eventRegister", authCheck, async (req, res) => {
	const event = await findEvent(req);
	const userinfo = await userDetails(req.user._id);
	// console.log("userinfo = ", userinfo);
	let referralCodeAlreadyUsed = false;
	if (
		userinfo.referralCode !== null &&
		userinfo.referralCode !== undefined &&
		userinfo.referralCode &&
		userinfo.referralCode.length > 0
	) {
		referralCodeAlreadyUsed = true;
	}

	const context = {
		event: event,
		authenticated: req.isAuthenticated(),
		isPerson: "false",
		referralCodeUsed: referralCodeAlreadyUsed.toString(),
		refCode: referralCodeAlreadyUsed ? userinfo.referralCode : "nullvoid",
	};
	res.render("submit", { ...context, user: req.session.user });
});

router.post("/eventRegister", async (req, res) => {
	const event = await findEvent(req);
	// saving required info to userDetails
	const {
		referralCode,
		phone_number,
		fullName,
		collegeName,
		degree,
		branch,
	} = req.body;
	const userinfo = await userDetails(req.user._id);
	const userTable = require("../models/User");

	let referralCodeAlreadyUsed = false;
	if (
		userinfo.referralCode !== null &&
		userinfo.referralCode !== undefined &&
		userinfo.referralCode &&
		userinfo.referralCode.length > 0
	) {
		referralCodeAlreadyUsed = true;
		await userTable.updateOne(
			{ _id: req.user._id },
			{
				phoneNumber: phone_number,
				fullName: fullName,
				collegeName: collegeName,
				degree: degree,
				branch: branch,
			}
		);
	} else {
		await userTable.updateOne(
			{ _id: req.user._id },
			{
				phoneNumber: phone_number,
				fullName: fullName,
				collegeName: collegeName,
				degree: degree,
				branch: branch,
				referralCode: referralCode,
			}
		);
	}

	const eventTable = require("../models/Events");

	await eventTable.updateOne(
		{ _id: event._id },
		{ $push: { registeredUsers: { user_id: req.user._id } } }
	);
	res.redirect(`/event?event=${event.name}`);
});

router.post(
	"/addevent",
	adminCheck,
	upload.single("image"),
	async (req, res) => {
		if (req.session.admin == "1") {
			var found = await events.findOne({ name: req.body.name });

			if (!found) {
				const eventname = req.body.name
					.split(" ")
					.map(
						(w) => w[0].toUpperCase() + w.substring(1).toLowerCase()
					)
					.join(" ");
				const data = {
					club: req.body.club,
					info: req.body.info,
					name: eventname,
					content: req.body.content,
					event_image: req.body.event_image,
					rulebook_link: req.body.rulebook_link,
					problemset_link: req.body.problemset_link,
				};
				const event = new events(data);
				await event.save((err) => {
					if (err) {
						res.send("DATA not saved" + err);
					} else {
						res.render("admin/adminoption");
					}
				});
			} else {
				const event_name = req.body.name
					.split(" ")
					.map(
						(w) => w[0].toUpperCase() + w.substring(1).toLowerCase()
					)
					.join(" ");

				var eventUpdated = await events.updateOne(
					{ name: event_name },
					req.body
				);
				if (!eventUpdated) {
					res.send("DATA not updated");
				} else {
					res.render("admin/adminoption");
				}
			}
		}
	}
);

module.exports = router;
