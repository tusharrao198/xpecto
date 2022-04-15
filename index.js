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
var url = require("url");
const { findEvent, findEventFromId, findUserTeam } = require("./utils");

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
    res.render("aboutus", { authenticated: req.isAuthenticated() });
});

app.get("/contact", (req, res) => {
    res.render("contact", { authenticated: req.isAuthenticated() });
});

app.get("/sponsors", (req, res) => {
    res.render("sponsors", { authenticated: req.isAuthenticated() });
});

app.get("/faq", (req, res) => {
    res.render("faq", { authenticated: req.isAuthenticated() });
});

app.get("/", (req, res) => {
    res.render("index", { authenticated: req.isAuthenticated() });
});

app.get("/profile", authCheck, (req, res) => {
    res.render("profile", {
        user: req.user,
        authenticated: req.isAuthenticated(),
    });
});

app.get("/team", (req, res) => {
    res.render("team", {
        user: req.user,
        authenticated: req.isAuthenticated(),
    });
});

app.get("/events", async (req, res) => {
    var eventTable = require("./models/Events");
    const allEvents = await eventTable.find({}).lean();
    res.render("events", {
        events: allEvents,
        authenticated: req.isAuthenticated(),
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
    res.render("event", context);
});

app.get("/createTeam", authCheck, async (req, res) => {
    const event = await findEvent(req);
    const context = {
        event: event
    };
    res.render("Team/createTeam", context);
});

app.post("/createTeam", authCheck, async(req, res) => {
    const formDetails = req.body;
    const teamTable = require("./models/Team");
    var newteam = new teamTable({
        event: formDetails.event_id,
        name: formDetails.team_name,
        teamLeader: req.user._id,
    });
    newteam.save(function (err) {
        if (err) {
            console.log(err.errors);
            return err;
        }
    });
    const event = await findEventFromId(formDetails.event_id);
    res.redirect(`/event?event=${event.name}`);
});

app.get("/userTeam", authCheck, async (req, res) => {
    const event = await findEvent(req);
    const team = await findUserTeam(req);
    res.render("Team/userTeam", {
        team: team,
        authenticated: req.isAuthenticated(),
    });
});

app.get("/error", (req, res) =>
    res.send("error logging in", { authenticated: req.isAuthenticated() })
);

app.listen(port, (err) => {
    if (err) throw err;
    console.log(`Connection Established!! http://localhost:${port}`);
});
