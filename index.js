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
const upload = require("./multer.js");
const events = require("./models/Events.js");
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
} = require("./utils");
var url = require("url");

const { generateString } = require("./utils");
const code = require("./models/code.js");
const { name } = require("ejs");

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

app.get("/events", async (req, res) => {
    let eventTable = require("./models/Events");
    const allEvents = await eventTable.find({}).lean();
    res.render("events", {
        events: allEvents,
        authenticated: req.isAuthenticated(),
        user: req.session.user,
    });
});

app.get("/profile", authCheck, async (req, res) => {
    // joined teams : created_teams

    const context = await allEventDetails(req);
    res.render("profile", {
        user: req.user,
        authenticated: req.isAuthenticated(),
        context: context,
    });

    // console.log(typeof (context))
});
app.get("/terms", (req, res) => {
    res.render("tnc", {
        authenticated: req.isAuthenticated(),
    });
});

app.get("/faq", (req, res) => {
    res.render("faq", {
        authenticated: req.isAuthenticated(),
        user: req.session.user,
    });
});

// app.get("/register", (req, res) => {
//     res.render("register", {
//         user: req.session.user,
//         authenticated: req.isAuthenticated(),
//     });
// });

// app.get("/team", (req, res) => {
//     res.render("team", {
//         user: req.session.user,
//         authenticated: req.isAuthenticated(),
//     });
// });

app.get("/event", authCheck, regCheck, async (req, res) => {
    const event = await findEvent(req);
    const team = await findUserTeam(req);

    const context = {
        event: event,
        team: team,
        authenticated: req.isAuthenticated(),
    };
    res.render("event", { ...context, user: req.session.user });
});

app.get("/eventRegister", authCheck, async (req, res) => {
    const event = await findEvent(req);
    const context = {
        event: event,
        authenticated: req.isAuthenticated(),
    };
    res.render("submit", { ...context, user: req.session.user });
});
app.post("/eventRegister", async (req, res) => {
    const event = await findEvent(req);
    const eventTable = require("./models/Events");
    await eventTable.updateOne(
        { _id: event._id },
        { $push: { registeredUsers: { user_id: req.user._id } } }
    );
    res.redirect(`/event?event=${event.name}`);
});

app.get("/createTeam", authCheck, async (req, res) => {
    const event = await findEvent(req);
    const context = {
        event: event,
        authenticated: req.isAuthenticated(),
    };
    res.render("createTeam", { ...context, user: req.session.user });
});

app.post("/createTeam", authCheck, async (req, res) => {
    await createNewTeam(req);
    const event = await findEvent(req);

    res.redirect(`/event?event=${event.name}`);
});

app.get("/joinTeam", authCheck, async (req, res) => {
    const context = {
        authenticated: req.isAuthenticated(),
    };
    res.render("joinTeam", { ...context, user: req.session.user });
});

app.get("/deleteTeam", authCheck, async (req, res) => {
    const current_url = url.parse(req.url, true);
    const params = current_url.query;
    const teamTable = require("./models/Team");

    const event = await findEventFromId(params.event);

    let team = await teamTable
        .findOne({ event: event._id, teamLeader: req.user._id })
        .lean();

    if (team != null) {
        await deleteTeam(params.team);
        res.redirect(`/event?event=${event.name}`);
    } else {
        console.log("Only Team Leader can delete a team!");
    }
});

app.post("/joinTeam", authCheck, async (req, res) => {
    const inviteCode = await joinTeam(req);
    if (inviteCode != null) {
        const team_id = inviteCode.team;
        const teamTable = require("./models/Team");
        const team = await teamTable.findOne({ _id: team_id }).lean();
        const event_id = team.event;

        const event = await findEventFromId(event_id);
        // const eventTable = require('./models/Events');
        // await eventTable.updateOne(
        //     { _id: event._id },
        //     { $push: { registeredUsers : { user_id : req.user._id } } }
        // );
        res.redirect(`/event?event=${event.name}`);
    } else {
        res.redirect(`/joinTeam`);
    }
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
    let inviteCode = await inviteCodeTable.findOne({ team: team._id }).lean();

    const leaderInfo = await userDetails(team.teamLeader);
    let membersId = team.members;
    let membersInfo = [];
    for (let i = 0; i < membersId.length; i++) {
        const userInfo = await userDetails(membersId[i].member_id);
        membersInfo.push(userInfo);
    }
    // only team leader can delete a team and generate a invite code.
    // const teamTable = require("./models/Team");
    // let teaminfo = await teamTable
    //     .findOne({ event: team.event, teamLeader: req.user._id })
    //     .lean();
    // let leader = false;
    // if (teaminfo != null) {
    //     leader = true;
    // }

    // event details
    const event = await findEvent(req);

    // user info
    // let leaderinfo = null;
    // if (leader) {
    //     leaderinfo = await userDetails(req.user._id);
    // } else {
    //     const teamdata = await teamTable.findOne({ event: team.event }).lean();
    //     leaderinfo = await userDetails(teamdata.teamLeader);
    // }

    //team member details
    // let members_info = [];
    // for (let index = 0; index < team.members.length; index++) {
    //     let mem_id = team.members[index].member_id;
    //     let info = await userDetails(mem_id);
    //     members_info.push(info);
    // }
    context = {
        event: event,
        team: team,
        authenticated: req.isAuthenticated(),
        inviteCode: null,
        validUpto: null,
        isLeader: team.teamLeader.toString() === req.user._id.toString(),
        // leader: leader,
        leaderinfo: leaderInfo,
        membersinfo: membersInfo,
    };
    // console.log(team.teamLeader);
    // console.log(req.user._id.toString());
    // console.log(team.teamLeader.toString() === req.user._id.toString());
    // console.log(team);
    if (inviteCode != null && inviteCode.validUpto >= Date.now()) {
        context.inviteCode = inviteCode.code;
        context.validUpto = inviteCode.validUpto;
    }

    res.render("userTeam", { ...context, user: req.session.user });
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

app.get("/adminlogin", (req, res) => {
    req.session.admin == "0";
    res.render("admin/adminlogin.ejs");
});

app.post("/adminauth", (req, res) => {
    if (
        req.body.email == process.env.ADMINEMAIL &&
        req.body.password == process.env.ADMINPASSWORD
    ) {
        req.session.admin = "1";
        res.render("admin/adminoption.ejs");
    } else {
        res.redirect("/adminlogin");
    }
});

app.post("/addevent", upload.single("image"), async (req, res) => {
    if (req.session.admin == "1") {
        var found = await events.findOne({ name: req.body.name });

        if (!found) {
            const eventname = req.body.name
                .split(" ")
                .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
                .join(" ");
            const data = {
                club: req.body.club,
                info: req.body.info,
                name: eventname,
                content: req.body.content,
                event_image: req.body.event_image,
                rulebook_link: req.body.rulebook_link,
                problemset_link: req.body.problemset_link,
            };
            const event = new events(data);
            await event.save((err) => {
                if (err) {
                    res.send("DATA not saved" + err);
                } else {
                    res.render("admin/adminoption.ejs");
                }
            });
        } else {
            const event_name = req.body.name
                .split(" ")
                .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
                .join(" ");

            var eventUpdated = await events.updateOne(
                { name: event_name },
                req.body
            );
            if (!eventUpdated) {
                res.send("DATA not updated");
            } else {
                res.render("admin/adminoption.ejs");
            }
        }
    }
});

app.listen(port, (err) => {
    if (err) throw err;
    console.log(`Connection Established!! http://localhost:${port}`);
});
