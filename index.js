const express = require("express");
const port = process.env.PORT || 5000;
const passport = require("passport");
const passportSetup = require("./Utils/passport-setup");
const cookieSession = require("cookie-session");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const keys = require("./Utils/keys");
const authRoutes = require("./Utils/auth-routes");
const paymentRoutes = require("./Utils/payment");
// const indexWebRoutes = require("./routes/web/index");
// const paymentWebRoutes = require("./routes/web/payments");

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

app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("[STATUS] Connected to Database"));

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

app.get("/error", (req, res) => res.send("error logging in"));

app.listen(port, (err) => {
    if (err) throw err;
    console.log("Connection Established!!");
});
