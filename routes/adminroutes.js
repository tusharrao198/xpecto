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
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const CsvParser = require("json2csv").Parser;

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

router.get("/eventteamdetails", adminCheck, async (req, res) => {
    let eventTable = require("../models/Events");
    const allEvents = await eventTable.find({}).lean();
    res.render("admin/eventteamcsv", {
        authenticated: false,
        events: allEvents,
    });
});

router.post("/eventteamdetails", adminCheck, async (req, res) => {
    const allTeams = require("../models/Team");
    const allEvents = require("../models/Events");
    const userDetails = require("../models/User");
    let eventID = req.body.event;
    eventID = eventID.slice(0, -1);
    let records = [];
    // console.log(eventID);
    const query = { event: eventID };
    // console.log(query)
    const teams = await allTeams.find(query).lean();
    const eventDetails = await allEvents.findOne({ _id: eventID }).lean();
    // console.log(eventDetails);
    const eventName = eventDetails.name;
    if (teams.length === 0)
        return res.send(
            `<h1>No registrations yet for event: ${eventName} </h1>`
        );
    for (let i = 0; i < teams.length; i++) {
        let allMembers = [];
        const teamName = teams[i].name;
        let members = teams[i].members;
        let leaderID = teams[i].teamLeader;
        for (let j = 0; j < members.length; j++) {
            const userID = members[j].member_id;
            let user = await userDetails.findOne({ _id: userID });
            if (user) {
                const userData = {
                    Name: user.displayName,
                    Email: user.email,
                    "PhNo.": user.phoneNumber,
                };
                allMembers.push(JSON.stringify(userData));
            }
        }
        let leader = await userDetails.findOne({ _id: leaderID });
        let leaderData;
        if (leader) {
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
    if (records.length === 0) {
        // res.json({ status: "No registrations yet" });
        res.send(`<h1>No registrations yet for event: ${eventName} </h1>`);
    } else {
        const csvFields = [
            "Event Name",
            "Team Name",
            "Leader",
            "Team Memebers",
        ];
        const csvParser = new CsvParser({ csvFields });
        const csvData = csvParser.parse(records);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + eventName + ".csv"
        );
        res.status(200).end(csvData);
    }
});

router.post("/eventregistrations", adminCheck, async (req, res) => {
    const allTeams = require("../models/Team");
    const allEvents = require("../models/Events");
    const userDetails = require("../models/User");

    let eventID = req.body.event;
    eventID = eventID.slice(0, -1);

    const eventDetails = await allEvents.findOne({ _id: eventID }).lean();
    const regUsers = eventDetails.registeredUsers;
    // console.log("A = ", eventDetails);

    let records = [];
    for (let i = 0; i < regUsers.length; i++) {
        const userID = regUsers[i].user_id;
        let user = await userDetails.findOne({ _id: userID });
        if (user) {
            const userData = {
                Name: user.displayName,
                Email: user.email,
                Phone: user.phoneNumber,
                RefCode: user.referralCode,
            };
            records.push(userData);
        }
    }
    context = {
        records: records,
    };
    // console.log("rec = ", records);
    res.render("admin/eventwisereg", { ...context, totalreg: records.length });
});

module.exports = router;
