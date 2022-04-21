const path = require("path");
const express = require("express");
const port = process.env.PORT || 5000;
const passport = require("passport");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { authCheck } = require("./middleware/auth");
const authRoutes = require("./routes/authroutes");
const paymentRoutes = require("./middleware/payment");
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
    allEventDetails
} = require("./utils");
var url = require("url");

const { generateString } = require("./utils");
const code = require("./models/code.js");

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
app.use('/xpecto.ico', express.static('../static/images/xpecto.ico'));
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
app.use("/payment", authCheck, paymentRoutes);

app.get("/about", (req, res) => {
    res.render("aboutus", {
        authenticated: req.isAuthenticated(),
        user: req.session.user,
    });
});

app.get("/contact", (req, res) => {
    res.render("contact", {
        authenticated: req.isAuthenticated(),
        user: req.session.user,
    });
});

app.get("/sponsors", (req, res) => {
    res.render("sponsors", {
        authenticated: req.isAuthenticated(),
        user: req.session.user,
    });
});

app.get("/faq", (req, res) => {
    res.render("faq", {
        authenticated: req.isAuthenticated(),
        user: req.session.user,
    });
});

app.get("/", (req, res) => {
    if (!req.session.user) {
        user = {
            status: 0,
        };
        req.session.user = user;
    }
    res.render("index", {
        authenticated: req.isAuthenticated(),
        user: req.session.user,
    });
});

app.get("/profile", authCheck, async (req, res) => {
    const context = await allEventDetails(req);
    res.render("profile", {
        user: req.user,
        authenticated: req.isAuthenticated(),
        ...context
    });
});

app.get("/team", (req, res) => {
    res.render("team", {
        user: req.session.user,
        authenticated: req.isAuthenticated(),
    });
});

app.get("/events", async (req, res) => {
    var eventTable = require("./models/Events");
    const allEvents = await eventTable.find({}).lean();
    res.render("events", {
        events: allEvents,
        authenticated: req.isAuthenticated(),
        user: req.session.user,
    });
});

app.get("/event", authCheck, async (req, res) => {
    const event = await findEvent(req);
    const team = await findUserTeam(req);

    const context = {
        event: event,
        team: team,
        authenticated: req.isAuthenticated(),
    };
    res.render("event", { ...context, user: req.session.user });
});

app.get("/createTeam", authCheck, async (req, res) => {
    const event = await findEvent(req);
    const context = {
        event: event,
        authenticated: req.isAuthenticated(),
    };
    res.render("Team/createTeam", { ...context, user: req.session.user });
});

app.post("/createTeam", authCheck, async (req, res) => {
    await createNewTeam(req);
    const event = await findEventFromId(req.body.event_id);
    res.redirect(`/event?event=${event.name}`);
});

app.get("/joinTeam", authCheck, async (req, res) => {
    const event = await findEvent(req);
    const context = {
        event: event,
        authenticated: req.isAuthenticated(),
    };
    res.render("Team/joinTeam", { ...context, user: req.session.user });
});

app.get("/deleteTeam", authCheck, async (req, res) => {
    const current_url = url.parse(req.url, true);
    const params = current_url.query;

    await deleteTeam(params.team);

    const event = await findEventFromId(params.event);
    res.redirect(`/event?event=${event.name}`);
});

app.post("/joinTeam", authCheck, async (req, res) => {
    await joinTeam(req);
    const event = await findEventFromId(req.body.event_id);
    res.redirect(`/event?event=${event.name}`);
});

app.get("/removeMember", authCheck, async (req, res) => {
    await removeMember(req);
    const team = await findUserTeamFromId(req);
    const event = await findEventFromId(team.event);
    res.redirect(`/userTeam?event=${event.name}`);
});

app.get("/userTeam", authCheck, async (req, res) => {
    const team = await findUserTeam(req);
    const inviteCodeTable = require("./models/InviteCode");
    var inviteCode = await inviteCodeTable.findOne({ team: team._id }).lean();
    context = {
        team: team,
        authenticated: req.isAuthenticated(),
        inviteCode: null,
        validUpto: null,
    };
    // console.log(team);
    if (inviteCode != null && inviteCode.validUpto >= Date.now()) {
        context.inviteCode = inviteCode.code;
        context.validUpto = inviteCode.validUpto;
    }

    res.render("Team/userTeam", { ...context, user: req.session.user });
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

// onetime coupon generate logic
// app.get("/xyzabc",async (req,res)=>{
//     const a=[]
//     for (let index = 0; index < 200; index++) {
//         let b=(await generateString(16));
//         a[index]={
//             code:b,
//             used:0,
//         };

//     }
//     for (let index = 0; index < 200; index++) {
//         console.log(a[index].code);
//         var newDoc =new code(a[index]);
//         newDoc.save((err)=>{
//             if (err) return handleError(err);
//         })

//     }

// })

app.listen(port, (err) => {
    if (err) throw err;
    console.log(`Connection Established!! http://localhost:${port}`);
});
