const path = require("path");
const express = require("express");
const port = process.env.PORT || 5000;
const passport = require("passport");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const keys = require("./config/keys");
const authRoutes = require("./middleware/auth");
const paymentRoutes = require("./middleware/payment");
const connectDB = require("./config/db");

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

app.set("views", "./templates");
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/static"));
app.use("/images", express.static(__dirname + "static/images"));

app.use(
    cookieSession({
        maxAge: 24 * 60 * 60 * 1000,
        keys: [keys.session.cookieKey],
    })
);

// Sessions middleware
app.use(
    session({
        secret: "random_key_string",
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
app.use("/payment", paymentRoutes);

app.get("/about", (req, res) => {
    res.render("aboutus");
});

app.get("/", (req, res) => {
    res.render("index");
});

const authCheck = (req, res, next) => {
    if (!req.user) {
        res.redirect("/");
    } else {
        next();
    }
};

app.get("/success", authCheck, (req, res) => {
    res.render("success", { user: req.user });
});

app.get("/team", authCheck, (req, res) => {
    res.render("team", { user: req.user });
});

app.get("/events", authCheck,async (req, res) => {
    var eventTable = require('./models/Events');
    const events = await eventTable.find({}).lean();
    res.render("events", {"events":events});
});

app.get("/error", (req, res) => res.send("error logging in"));

app.listen(port, (err) => {
    if (err) throw err;
    console.log("Connection Established!!");
});
