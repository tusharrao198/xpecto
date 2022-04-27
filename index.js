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

app.get("/", (req, res) => {
    res.render("index", {
        authenticated: req.isAuthenticated(),
    });
});

app.get("/events", (req, res) => {
    res.render("events", {
        authenticated: req.isAuthenticated(),
    });
});

app.get("/profile", authCheck, async (req, res) => {
    const context = await allEventDetails(req);
    res.render("profile", {
        user: req.user,
        authenticated: req.isAuthenticated(),
        ...context,
    });
});

app.get("/register", (req, res) => {
    res.render("register", {
        user: req.session.user,
        authenticated: req.isAuthenticated(),
    });
});

// app.get("/team", (req, res) => {
//     res.render("team", {
//         user: req.session.user,
//         authenticated: req.isAuthenticated(),
//     });
// });

app.listen(port, (err) => {
    if (err) throw err;
    console.log(`Connection Established!! http://localhost:${port}`);
});
