const path = require("path");
const express = require("express");
const port = process.env.PORT || 5000;
const passport = require("passport");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { authCheck, adminCheck } = require("./middleware/auth");
const authRoutes = require("./routes/authroutes");
const eventRoutes = require("./routes/eventroutes");
const teamRoutes = require("./routes/teamroutes");
const navRoutes = require("./routes/navroutes");
const adminRoutes = require("./routes/adminroutes");
const webinarRoutes = require("./routes/webinarroutes");
const workshopRoutes = require("./routes/workshoproutes");
const upload = require("./multer.js");
const events = require("./models/Events.js");
const workshops = require("./models/workshop");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const CsvParser = require("json2csv").Parser;
const connectDB = require("./config/db");
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
} = require("./utils");
var url = require("url");

const code = require("./models/code.js");
const { none } = require("./multer.js");

// Load config
require("dotenv").config({ path: "./config/config.env" });

// Passport Config
require("./config/passport")(passport);

// connect to Database
connectDB();

const app = express();

// Configure bodyParser
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);

// set template view engine
app.set("views", "./templates");
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/static"));
app.use("/images", express.static(__dirname + "static/images"));

app.use(function (req, res, next) {
	if (!req.user) {
		res.header(
			"Cache-Control",
			"private, no-cache, no-store, must-revalidate"
		);
		res.header("Expires", "-1");
		res.header("Pragma", "no-cache");
	}
	next();
});

app.use("/xpecto.ico", express.static("../static/images/xpecto.ico"));
// Sessions middleware
app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: false,
		store: MongoStore.create({ mongoUrl: process.env.MONGO_DATABASE_URI }),
	})
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/", eventRoutes);
app.use("/", teamRoutes);
app.use("/", navRoutes);
app.use("/", adminRoutes);
app.use("/", webinarRoutes);
app.use("/", workshopRoutes);

app.get("/", async (req, res) => {
	const homepageinfo = await homepageInfo();
	const sponinfo = await sponsorsInfo();
	const faqinfo = await FAQInfo();

	const discordlinkTable = require("./models/discordserverlinks");
	const dislink = await discordlinkTable.findOne().lean();

	const alumniTable = require("./models/alumnis");
	const alumnis_data = await alumniTable.find().lean();

	const updateTable = require("./models/updates");
	const update_data = await updateTable.find().lean();

	let assoc_spon = [];
	let gold_spon = [];
	let bronze_spon = [];
	let event_spon = [];
	let partner = [];

	for (let i = 0; i < sponinfo.length; i++) {
		if (sponinfo[i].spon_type === "Associate Sponsors") 
		{
			assoc_spon.push(sponinfo[i]);
		} else if (sponinfo[i].spon_type === "Gold Sponsors") 
		{
			gold_spon.push(sponinfo[i]);
		}
		else if (sponinfo[i].spon_type === "Bronze Sponsors")
		{
			bronze_spon.push(sponinfo[i]);
		}
		else if (sponinfo[i].spon_type === "Event Sponsors")
		{
			event_spon.push(sponinfo[i]);
		}
		else if (sponinfo[i].spon_type === "Partner")
		{
			partner.push(sponinfo[i]);
		}
	}

	context = {
		homepageInfo:
			homepageinfo === null || homepageinfo === undefined
				? "false"
				: homepageinfo[0],
		sponInfo:
			sponinfo === null || sponinfo === undefined ? "false" : sponinfo,
		faqInfo: faqinfo === null || faqinfo === undefined ? "false" : faqinfo,
		assoc_sponsors: assoc_spon,
		gold_sponsors: gold_spon,
		bronze_sponsors: bronze_spon,
		event_sponsors: event_spon,
		partners: partner,
		discordlink: dislink !== null ? dislink.link : "#",
		alumnis: alumnis_data,
		updatesdata: update_data,
	};

	res.render("index", {
		authenticated: req.isAuthenticated(),
		...context,
	});
});

app.get("/generateInviteCode", authCheck, async (req, res) => {
	await deleteOldInviteCode(req);
	await createNewInviteCode(req);

	const team = await findUserTeamFromId(req);
	const event = await findEventFromId(team.event);
	res.redirect(`/userTeam?event=${event.name}`);
});

// app.get("/error", (req, res) =>
// 	res.send("error logging in", {
// 		authenticated: req.isAuthenticated(),
// 		user: req.session.user,
// 	})
// );

app.get("/xyzgeneratecodeabc", async (req, res) => {
	context = {
		authenticated: req.isAuthenticated(),
		success: "false",
		get_call: "true",
		campus_ambassador_name: "",
		place: "",
		code: "",
	};
	res.render("admin/couponCode", { ...context, user: req.user });
});

// onetime coupon generate logic
app.post("/xyzgeneratecodeabc", async (req, res) => {
	// console.log("req.session.admin = ", req.session.admin);
	if (req.session.admin === "1") {
		// console.log("req body =", req.body);
		const referralCode = await generateString(8);
		const response = await saveReferralCode(req, referralCode);
		// console.log("referralCode = ", referralCode, typeof referralCode);
		// console.log("response = ", response);
		let final_res = "false";
		if (response !== null && response !== undefined) {
			final_res = "true";
		}
		context = {
			authenticated: req.isAuthenticated(),
			success: final_res,
			codeinfo: req.body,
			get_call: "false",
		};
		if (final_res) {
			res.render("admin/couponCode", { ...context, user: req.user });
		} else {
			res.render("admin/couponCode", { ...context, user: req.user });
		}
	} else {
		res.redirect("/adminlogin");
	}
});

app.get("/404", function (req, res, next) {
	// trigger a 404 since no other middleware
	// will match /404 after this one, and we're not
	// responding here
	next();
});

app.get("/403", function (req, res, next) {
	// trigger a 403 error
	var err = new Error("not allowed!");
	err.status = 403;
	next(err);
});

app.get("/500", function (req, res, next) {
	// trigger a generic (500) error
	next(new Error("keyboard cat!"));
});

app.use(function (req, res, next) {
	res.status(404);

	res.format({
		html: function () {
			res.render("error_pages/404", { url: req.url });
		},
		json: function () {
			res.json({ error: "Not found" });
		},
		default: function () {
			res.type("txt").send("Not found");
		},
	});
});

app.use(function (err, req, res, next) {
	// we may use properties of the error object
	// here and next(err) appropriately, or if
	// we possibly recovered from the error, simply next().
	res.status(err.status || 500);
	res.render("error_pages/500", { error: err });
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get("*", function (req, res) {
	res.status(404).send("<h1>404 NOT FOUND!</h1>");
});

app.listen(port, (err) => {
	if (err) throw err;
	console.log(`Connection Established!! http://localhost:${port}`);
});
