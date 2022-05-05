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
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
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
    res.render("index", {
        authenticated: req.isAuthenticated(),
        homepageInfo:
            homepageinfo === null || homepageinfo === undefined
                ? "false"
                : homepageinfo[0],
        sponInfo:
            sponinfo === null || sponinfo === undefined ? "false" : sponinfo,
        faqInfo: faqinfo === null || faqinfo === undefined ? "false" : faqinfo,
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

app.get("/details",async (req,res) => {
    let eventTable = require("./models/Events");
    const allEvents = await eventTable.find({}).lean();
    res.render("details",{authenticated:false,events:allEvents});
});
const CsvParser = require("json2csv").Parser;

app.post("/details",async (req,res) => {
    const allTeams = require("./models/Team");
    const allEvents = require("./models/Events");
    const userDetails = require("./models/User");
    let eventID = req.body.event;
    eventID = eventID.slice(0,-1); 
    var records = [];
    // console.log(eventID);
    const query = {event : eventID};
    // console.log(query)
    const teams = await allTeams.find(query).lean();
    const eventDetails = await allEvents.findOne({_id : eventID}).lean();
    // console.log(eventDetails);
    const eventName = eventDetails.name;
    if(teams.length===0) return res.json({"status":"no reg yet"});
    for (var i = 0; i < teams.length; i++) {
        var allMembers = [];
        const teamName = teams[i].name;
        var members = teams[i].members;
        var leaderID = teams[i].teamLeader;
        for (var j = 0; j < members.length; j++) {
            const userID = members[j].member_id;
            var user = await userDetails.findOne({ _id: userID });
            if(user)
            {
                const userData = {
                    Name: user.displayName,
                    Email: user.email,
                    "PhNo.": user.phoneNumber,
                };
                allMembers.push(JSON.stringify(userData));
            }
        }
        var leader = await userDetails.findOne({ _id: leaderID });
        var leaderData;
        if(leader)
        {
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
    if(records.length===0)
    {
        res.json({status:"No registrations yet"});
    } 
    else
    {
        const csvFields = ["Event Name", "Team Name", "Leader", "Team Memebers"];
        const csvParser = new CsvParser({ csvFields });
        const csvData = csvParser.parse(records);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename="+eventName+".csv");
        res.status(200).end(csvData);
    }
});

app.listen(port, (err) => {
    if (err) throw err;
    console.log(`Connection Established!! http://localhost:${port}`);
});
