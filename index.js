const express = require("express")
const port = process.env.PORT || 5000
const passport = require('passport');
const passportSetup = require('./Utils/passport-setup');
const cookieSession = require("cookie-session");
const keys = require('./Utils/keys');
const authRoutes = require('./Utils/auth-routes');

let app = express()

app.set("views", "./templates")
app.set("view engine", "ejs")

app.use(express.static(__dirname + "/static"))

app.use(cookieSession({
    maxAge: 24*60*60*1000,
    keys:[keys.session.cookieKey]
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.get("/about", (req, res) => {
    res.render("aboutus");
})
app.get("/", (req, res) => {
    res.render("index");
})


const authCheck = (req, res, next) => {
    if(!req.user){
        res.redirect('/');
    } else {
        next();
    }
};

app.get('/success', authCheck,(req, res) => {
    res.render('success',{user:req.user})
});
app.get('/error', (req, res) => res.send("error logging in"));

app.listen(port, (err) => {
    if (err) throw err;
    console.log("Connection Established!!")
})