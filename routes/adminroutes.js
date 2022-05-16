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
const {
	authCheck,
	adminCheck,
	eventCoordiCheck,
} = require("../middleware/auth");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const CsvParser = require("json2csv").Parser;

//////////////////// Event Updation API /////////////////////////////

router.get("/makeeventLive", adminCheck, async (req, res) => {
	let eventTable = require("../models/Events");
	const allEvents = await eventTable.find({}).lean();
	res.render("admin/makeEventLive", {
		authenticated: false,
		events: allEvents,
	});
});

router.post("/makeeventLive", adminCheck, async (req, res) => {
	const eventTable = require("../models/Events");
	if (req.body.event) {
		let eventID = req.body.event;
		eventID = eventID.slice(0, -1);
		const eventDetails = await eventTable.findOne({ _id: eventID }).lean();
		console.log("event = \n", eventDetails);
		if (!eventDetails.live) {
			const response = await eventTable.updateOne(
				{ _id: eventID },
				{ live: true }
			);
			console.log("response = ", response);
			res.redirect("/makeeventLive");
			// res.send(
			// 	`<p>Event = ${eventDetails.name} made live \n ${eventDetails.live}</p>`
			// );
		} else {
			res.send(
				`<p>Event = ${eventDetails.name} already live \n ${eventDetails.live}</p>`
			);
		}
	} else {
		res.send(`<p>No event found!</p>`);
		console.log("No event found!");
	}
});

//////////////////// Event Updation API /////////////////////////////

/////////////////////// Event Data ////////////////////////////////

//////////////////// API for ADMINS. /////////////////////////////

// only admin can access this route.
router.get("/registrations", adminCheck, async (req, res) => {
	const User = require("../models/User");
	let regdata = await User.find().lean();
	const notCollegeCount = await registrationdifferentiate(regdata);
	res.render("admin/regdata", {
		authenticated: req.isAuthenticated(),
		totalreg: regdata.length,
		alluserinfo: regdata,
		not_college_count: notCollegeCount,
		college_count: regdata.length - notCollegeCount,
	});
});

// get registrations list csv
router.post("/registrations", adminCheck, async (req, res) => {
	const User = require("../models/User");
	let regdata = await User.find().lean();
	let records = [];
	for (let i = 0; i < regdata.length; i++) {
		const userData = {
			Name: regdata[i].displayName,
			FullName: regdata[i].fullName,
			FirstName: regdata[i].firstName,
			Email: regdata[i].email,
			Phone: regdata[i].phoneNumber,
			RefCode: regdata[i].referralCode,
			College: regdata[i].collegeName,
			Degree: regdata[i].degree,
			Branch: regdata[i].branch,
		};
		records.push(userData);
	}

	const csvFields = [
		"Name",
		"FullName",
		"FirstName",
		"Email",
		"Phone",
		"RefCodeUsed",
		"College",
		"Degree",
		"Branch",
	];
	const csvParser = new CsvParser({ csvFields });
	const csvData = csvParser.parse(records);
	res.setHeader("Content-Type", "text/csv");
	res.setHeader(
		"Content-Disposition",
		"attachment; filename=" + "Xpecto_Registrations.csv"
	);
	res.status(200).end(csvData);
});

router.get("/regcodecount", async (req, res) => {
	const referdata = await numberofReg_referCode();
	// console.log("referdata = ", referdata);
	res.render("admin/refcoderegdata", {
		authenticated: req.isAuthenticated(),
		refcode_data: referdata[0],
		totalreg: referdata[1],
	});
});

router.get("/registrationspublic", async (req, res) => {
	const User = require("../models/User");
	let regdata = await User.find().lean();
	const notCollegeCount = await registrationdifferentiate(regdata);
	res.render("admin/registrationspublic", {
		authenticated: req.isAuthenticated(),
		totalreg: regdata.length,
		alluserinfo: regdata,
		not_college_count: notCollegeCount,
		college_count: regdata.length - notCollegeCount,
	});
});

router.get("/adminlogin", (req, res) => {
	req.session.admin == "0";
	res.render("admin/adminlogin.ejs");
});

router.post("/adminauth", (req, res) => {
	if (
		req.body.email == process.env.ADMINEMAIL &&
		req.body.password == process.env.ADMINPASSWORD
	) {
		req.session.admin = "1";
		res.redirect(req.session.returnTo || "/");
		delete req.session.returnTo;
		// res.redirect("/registrations");
		// res.render("admin/adminoption.ejs");
	} else {
		res.redirect("/adminlogin");
	}
});

router.get("/eventteamdetails", adminCheck, async (req, res) => {
	let eventTable = require("../models/Events");
	const allEvents = await eventTable.find({}).lean();
	res.render("admin/eventteamcsv", {
		authenticated: false,
		events: allEvents,
	});
});

router.post("/eventteamdetails", adminCheck, async (req, res) => {
	const allTeams = require("../models/Team");
	const allEvents = require("../models/Events");
	const userDetails = require("../models/User");
	let eventID = req.body.event;
	eventID = eventID.slice(0, -1);
	let records = [];
	// console.log(eventID);
	const query = { event: eventID };
	// console.log(query)
	const teams = await allTeams.find(query).lean();
	const eventDetails = await allEvents.findOne({ _id: eventID }).lean();
	// console.log(eventDetails);
	const eventName = eventDetails.name;
	if (teams.length === 0)
		return res.send(
			`<h1>No registrations yet for event: ${eventName} </h1>`
		);
	for (let i = 0; i < teams.length; i++) {
		let allMembers = [];
		const teamName = teams[i].name;
		let members = teams[i].members;
		let leaderID = teams[i].teamLeader;
		for (let j = 0; j < members.length; j++) {
			const userID = members[j].member_id;
			let user = await userDetails.findOne({ _id: userID }).lean();
			if (user) {
				const userData = {
					Name: user.displayName,
					Email: user.email,
					"PhNo.": user.phoneNumber,
				};
				allMembers.push(JSON.stringify(userData));
			}
		}
		let leader = await userDetails.findOne({ _id: leaderID }).lean();
		let leaderData;
		if (leader) {
			leaderData = {
				Name: leader.displayName,
				Email: leader.email,
				"PhNo.": leader.phoneNumber,
			};
			leaderData = JSON.stringify(leaderData);
		}

		const thisRecord = {
			eventName: eventName,
			teamName: teamName,
			leader: leaderData,
			teamMembers: allMembers,
		};
		records.push(thisRecord);
	}
	if (records.length === 0) {
		// res.json({ status: "No registrations yet" });
		res.send(`<h1>No registrations yet for event: ${eventName} </h1>`);
	} else {
		const csvFields = [
			"Event Name",
			"Team Name",
			"Leader",
			"Team Memebers",
		];
		const csvParser = new CsvParser({ csvFields });
		const csvData = csvParser.parse(records);
		res.setHeader("Content-Type", "text/csv");
		res.setHeader(
			"Content-Disposition",
			"attachment; filename=" + eventName + ".csv"
		);
		res.status(200).end(csvData);
	}
});

router.post("/eventregistrations", adminCheck, async (req, res) => {
	const allTeams = require("../models/Team");
	const allEvents = require("../models/Events");
	const userDetails = require("../models/User");

	let eventID = req.body.event;
	eventID = eventID.slice(0, -1);

	const eventDetails = await allEvents.findOne({ _id: eventID }).lean();
	const regUsers = eventDetails.registeredUsers;
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
				College: user.collegeName,
				Branch: user.branch,
				Degree: user.degree,
			};
			records.push(userData);
		}
	}

	if (records.length === 0) {
		// res.json({ status: "No registrations yet" });
		res.send(
			`<h1>No registrations yet for event: ${eventDetails.name} </h1>`
		);
	} else {
		const csvFields = [
			"Name",
			"Email",
			"Phone",
			"RefCodeUsed",
			"College",
			"Branch",
			"Degree",
		];
		const csvParser = new CsvParser({ csvFields });
		const csvData = csvParser.parse(records);
		res.setHeader("Content-Type", "text/csv");
		res.setHeader(
			"Content-Disposition",
			"attachment; filename=" + eventDetails.name + "_regs.csv"
		);
		res.status(200).end(csvData);
	}
	// context = {
	// 	records: records,
	// };
	// // console.log("rec = ", records);
	// res.render("admin/eventwisereg", {
	// 	...context,
	// 	totalreg: records.length,
	// });
});
//////////////////// API for ADMINS. /////////////////////////////

//////////////////// for event coordis. /////////////////////////////

router.get("/eventcoordilogin", (req, res) => {
	req.session.iseventcoord == "0";
	res.render("eventcoordi/eventcoordilogin");
});

router.post("/eventcoordiauth", (req, res) => {
	// console.log(
	// 	"process.env.EVENTCOORDIEMAIL = ",
	// 	process.env.EVENTCOORDIEMAIL
	// );
	if (
		req.body.email == process.env.EVENTCOORDIEMAIL &&
		req.body.password == process.env.EVENTCOORDIPASS
	) {
		req.session.iseventcoord = "1";
		// res.redirect(req.session.returnTo || "/");
		res.redirect("/eventwiseteam");
		delete req.session.returnTo;
	} else {
		res.redirect("/eventcoordilogin");
	}
});

router.get("/eventwiseteam", eventCoordiCheck, async (req, res) => {
	let eventTable = require("../models/Events");
	const allEvents = await eventTable.find({}).lean();
	res.render("eventcoordi/eventteamcsv", {
		authenticated: false,
		events: allEvents,
	});
});

// generates csv for teams registered for an event
router.post("/eventwiseteam", eventCoordiCheck, async (req, res) => {
	const allTeams = require("../models/Team");
	const allEvents = require("../models/Events");
	const userDetails = require("../models/User");
	let eventID = req.body.event;
	eventID = eventID.slice(0, -1);
	let records = [];
	const query = { event: eventID };
	const teams = await allTeams.find(query).lean();
	const eventDetails = await allEvents.findOne({ _id: eventID }).lean();
	const eventName = eventDetails.name;
	if (teams.length === 0)
		return res.send(
			`<h1>No registrations yet for event: ${eventName} </h1>`
		);
	for (let i = 0; i < teams.length; i++) {
		let allMembers = [];
		const teamName = teams[i].name;
		let members = teams[i].members;
		let leaderID = teams[i].teamLeader;
		for (let j = 0; j < members.length; j++) {
			const userID = members[j].member_id;
			let user = await userDetails.findOne({ _id: userID }).lean();
			if (user) {
				const userData = {
					Name: user.displayName,
					Email: user.email,
					"PhNo.": user.phoneNumber,
				};
				allMembers.push(JSON.stringify(userData));
			}
		}
		let leader = await userDetails.findOne({ _id: leaderID }).lean();
		let leaderData;
		if (leader) {
			leaderData = {
				Name: leader.displayName,
				Email: leader.email,
				"PhNo.": leader.phoneNumber,
			};
			leaderData = JSON.stringify(leaderData);
		}

		const thisRecord = {
			eventName: eventName,
			teamName: teamName,
			leader: leaderData,
			teamMembers: allMembers,
		};
		records.push(thisRecord);
	}
	if (records.length === 0) {
		// res.json({ status: "No registrations yet" });
		res.send(`<h1>No registrations yet for event: ${eventName} </h1>`);
	} else {
		const csvFields = [
			"Event Name",
			"Team Name",
			"Leader",
			"Team Memebers",
		];
		const csvParser = new CsvParser({ csvFields });
		const csvData = csvParser.parse(records);
		res.setHeader("Content-Type", "text/csv");
		res.setHeader(
			"Content-Disposition",
			"attachment; filename=" + eventName + ".csv"
		);
		res.status(200).end(csvData);
	}
});

router.post("/eventwiseregs", eventCoordiCheck, async (req, res) => {
	const allTeams = require("../models/Team");
	const allEvents = require("../models/Events");
	const userDetails = require("../models/User");

	let eventID = req.body.event;
	eventID = eventID.slice(0, -1);

	const eventDetails = await allEvents.findOne({ _id: eventID }).lean();
	const regUsers = eventDetails.registeredUsers;

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
				College: user.collegeName,
				Branch: user.branch,
				Degree: user.degree,
			};
			records.push(userData);
		}
	}

	if (records.length === 0) {
		// res.json({ status: "No registrations yet" });
		res.send(
			`<h1>No registrations yet for event: ${eventDetails.name} </h1>`
		);
	} else {
		const csvFields = [
			"Name",
			"Email",
			"Phone",
			"RefCodeUsed",
			"College",
			"Branch",
			"Degree",
		];
		const csvParser = new CsvParser({ csvFields });
		const csvData = csvParser.parse(records);
		res.setHeader("Content-Type", "text/csv");
		res.setHeader(
			"Content-Disposition",
			"attachment; filename=" + eventDetails.name + "_regs.csv"
		);
		res.status(200).end(csvData);
	}

	// context = {
	// 	records: records,
	// };
	// res.render("eventcoordi/eventwisereg", {
	// 	...context,
	// 	totalreg: records.length,
	// });
});
//////////////////// for event coordis. /////////////////////////////

/////////////////////// Event Data ////////////////////////////////////////////////
module.exports = router;
