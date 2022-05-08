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
const { name } = require("ejs");
const { is } = require("express/lib/request");
const res = require("express/lib/response");
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

app.get("/", async (req, res) => {
	const homepageinfo = await homepageInfo();
	const sponinfo = await sponsorsInfo();
	const faqinfo = await FAQInfo();
	let assoc_spon = [];
	let title_spon = [];

	for (let i = 0; i < sponinfo.length; i++) {
		if (sponinfo[i].spon_type === "Associate Sponsors") {
			assoc_spon.push(sponinfo[i]);
		} else if (sponinfo[i].spon_type === "Title Sponsors") {
			title_spon.push(sponinfo[i]);
		}
	}

	res.render("index", {
		authenticated: req.isAuthenticated(),
		homepageInfo:
			homepageinfo === null || homepageinfo === undefined
				? "false"
				: homepageinfo[0],
		sponInfo:
			sponinfo === null || sponinfo === undefined ? "false" : sponinfo,
		faqInfo: faqinfo === null || faqinfo === undefined ? "false" : faqinfo,
		assoc_sponsors: assoc_spon,
		title_sponsors: title_spon,
	});
});

app.get("/generateInviteCode", authCheck, async (req, res) => {
	await deleteOldInviteCode(req);
	await createNewInviteCode(req);

	const team = await findUserTeamFromId(req);
	const event = await findEventFromId(team.event);
	res.redirect(`/userTeam?event=${event.name}`);
});

app.get("/error", (req, res) =>
	res.send("error logging in", {
		authenticated: req.isAuthenticated(),
		user: req.session.user,
	})
);

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

app.listen(port, (err) => {
	if (err) throw err;
	console.log(`Connection Established!! http://localhost:${port}`);
});
