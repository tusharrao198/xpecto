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
const CsvParser = require("json2csv").Parser;

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

router.get("/keytalkdetails", adminCheck, async (req, res) => {
	let keytalkTable = require("../models/keytalks");
	const allkeytalks = await keytalkTable.find({}).lean();
	res.render("admin/keytalkregcsv", {
		authenticated: false,
		keytalks: allkeytalks,
	});
});

router.post("/keytalkregistrations", adminCheck, async (req, res) => {
	const allkeytalks = require("../models/keytalks");
	const userDetails = require("../models/User");

	let keytalkID = req.body.keytalk;
	keytalkID = keytalkID.slice(0, -1);

	const keytalkDetails = await allkeytalks.findOne({ _id: keytalkID }).lean();
	if (keytalkDetails) {
		const regUsers = keytalkDetails.registeredUsers;
		let records = [];
		for (let i = 0; i < regUsers.length; i++) {
			const userID = regUsers[i].user_id;
			let user = await userDetails.findOne({ _id: userID }).lean();
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
				`<h1>No registrations yet for event: ${keytalkDetails.name} </h1>`
			);
		} else {
			const csvFields = ["Name", "Email", "Phone", "RefCodeUsed"];
			const csvParser = new CsvParser({ csvFields });
			const csvData = csvParser.parse(records);
			const filename = `${keytalkDetails.name}_regs`;
			try {
				res.setHeader("Content-Type", "application/csv");
				// res.setHeader(
				// 	"Content-Disposition: attachment; filename*=UTF-8''".rawurlencode(
				// 		`${keytalkDetails.name}_regs.csv`
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
			`<h1>No registrations yet for event: ${keytalkDetails.name} </h1>`
		);
	}
});

module.exports = router;
