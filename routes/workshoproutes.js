const router = require("express").Router();

const {
	findEvent,
	findworkshop,
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
const CsvParser = require("json2csv").Parser;

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


router.get("/workshopdetails", adminCheck, async (req, res) => {
	let workshopTable = require("../models/workshop");
	const allworkshops = await workshopTable.find({}).lean();
	res.render("admin/workshopregcsv", {
		authenticated: false,
		workshops: allworkshops,
	});
});

router.post("/workshopregistrations", adminCheck, async (req, res) => {
	const allworkshops = require("../models/workshop");
	const userDetails = require("../models/User");

	let workshopID = req.body.workshop;
	workshopID = workshopID.slice(0, -1);

	const workshopDetails = await allworkshops.findOne({ _id: workshopID }).lean();
	if (workshopDetails) {
		const regUsers = workshopDetails.registeredUsers;
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
				`<h1>No registrations yet for event: ${workshopDetails.name} </h1>`
			);
		} else {
			const csvFields = ["Name", "Email", "Phone", "RefCodeUsed"];
			const csvParser = new CsvParser({ csvFields });
			const csvData = csvParser.parse(records);
			const filename = `${workshopDetails.name}_regs`;
			try {
				res.setHeader("Content-Type", "application/csv");
				// res.setHeader(
				// 	"Content-Disposition: attachment; filename*=UTF-8''".rawurlencode(
				// 		`${workshopDetails.name}_regs.csv`
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
			`<h1>No registrations yet for event: ${workshopDetails.name} </h1>`
		);
	}
});


module.exports = router;
