// Google Oauth 


const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys');

const GOOGLE_CLIENT_ID = keys.google.clientID;
const GOOGLE_CLIENT_SECRET = keys.google.clientSecret;

passport.serializeUser(function(user, cb) {
    cb(null, user);
});
  
passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback",
  },
  function(accessToken, refreshToken, profile, done) {
      
      return done(null, profile);
  }
));
