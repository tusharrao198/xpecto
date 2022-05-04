const router = require("express").Router();
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
} = require("../utils");
var url = require("url");
const { authCheck, adminCheck } = require("../middleware/auth");

// only admin can access this route.
router.get("/registrations", adminCheck, async (req, res) => {
    const User = require("../models/User");
    let regdata = await User.find().lean();
    const notCollegeCount = await registrationdifferentiate(regdata);
    res.render("admin/regdata", {
        authenticated: req.isAuthenticated(),
        totalreg: regdata.length,
        alluserinfo: regdata,
        not_college_count: notCollegeCount,
        college_count: regdata.length - notCollegeCount,
    });
});

router.get("/regcodecount", async (req, res) => {
    const referdata = await numberofReg_referCode();
    res.render("admin/refcoderegdata", {
        authenticated: req.isAuthenticated(),
        refcode_data: referdata[0],
        totalreg: referdata[1],
    });
});

router.get("/registrationspublic", async (req, res) => {
    const User = require("../models/User");
    let regdata = await User.find().lean();
    const notCollegeCount = await registrationdifferentiate(regdata);
    res.render("admin/registrationspublic", {
        authenticated: req.isAuthenticated(),
        totalreg: regdata.length,
        alluserinfo: regdata,
        not_college_count: notCollegeCount,
        college_count: regdata.length - notCollegeCount,
    });
});

router.get("/adminlogin", (req, res) => {
    req.session.admin == "0";
    res.render("admin/adminlogin.ejs");
});

router.post("/adminauth", (req, res) => {
    if (
        req.body.email == process.env.ADMINEMAIL &&
        req.body.password == process.env.ADMINPASSWORD
    ) {
        req.session.admin = "1";
        res.redirect(req.session.returnTo || "/");
        delete req.session.returnTo;
        // res.redirect("/registrations");
        // res.render("admin/adminoption.ejs");
    } else {
        res.redirect("/adminlogin");
    }
});

module.exports = router;
