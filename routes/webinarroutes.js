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
const CsvParser = require("json2csv").Parser;

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
	// console.log("webinar = ", Object.keys(webinar));
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
	res.redirect(`/webinar?webinar=${webinar._id}`);
});

router.get("/webinar", authCheck, async (req, res) => {
	const webinar = await findWebinar(req);
	const checker = isRegisteredforEvent(req.user, webinar);
	// console.log("checke webinar = ", checker, "\n", webinar);
	if (webinar) {
		const context = {
			webinar: webinar,
			authenticated: req.isAuthenticated(),
			user: req.session.user,
			checker: checker,
		};
		res.render("webinar", context);
	} else {
		res.redirect("/webinars");
	}
});


router.get("/webinardetails", adminCheck, async (req, res) => {
	let webinarTable = require("../models/webinar");
	const allwebinars = await webinarTable.find({}).lean();
	res.render("admin/webinarregcsv", {
		authenticated: false,
		webinars: allwebinars,
	});
});

router.post("/webinarregistrations", adminCheck, async (req, res) => {
	const allwebinars = require("../models/webinar");
	const userDetails = require("../models/User");

	let webinarID = req.body.webinar;
	webinarID = webinarID.slice(0, -1);

	const webinarDetails = await allwebinars.findOne({ _id: webinarID }).lean();
	if (webinarDetails) {
		const regUsers = webinarDetails.registeredUsers;
		let records = [];
		for (let i = 0; i < regUsers.length; i++) {
			const userID = regUsers[i].user_id;
			let user = await userDetails.findOne({ _id: userID });
			if (user) {
				const userData = {
					Name: user.displayName,
					Email: user.email,
					Phone: user.phoneNumber,
					RefCode: user.referralCode,
				};
				records.push(userData);
			}
		}

		if (records.length === 0) {
			// res.json({ status: "No registrations yet" });
			res.send(
				`<h1>No registrations yet for event: ${webinarDetails.name} </h1>`
			);
		} else {
			const csvFields = ["Name", "Email", "Phone", "RefCodeUsed"];
			const csvParser = new CsvParser({ csvFields });
			const csvData = csvParser.parse(records);
			const filename = `${webinarDetails.name}_regs`;
			try {
				res.setHeader("Content-Type", "application/csv");
				// res.setHeader(
				// 	"Content-Disposition: attachment; filename*=UTF-8''".rawurlencode(
				// 		`${webinarDetails.name}_regs.csv`
				// 	)
				// );
				// res.setHeader("Content-Disposition", "attachment; filename*=UTF-8");
				res.attachment(`${filename}.csv`);
				res.status(200).end(csvData);
			} catch (error) {
				console.log("error:", error.message);
				res.status(500).send(error.message);
			}
		}
	} else {
		res.send(
			`<h1>No registrations yet for event: ${webinarDetails.name} </h1>`
		);
	}
});


module.exports = router;
