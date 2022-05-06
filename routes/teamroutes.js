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

router.get("/joinTeam", authCheck, async (req, res) => {
    // const check = await findIfUserRegistered(req);
    // console.log("check = ", check);
    // if (!check) {
    //     // res.redirect("/eventRegister");
    // }
    const userinfo = await userDetails(req.user._id);
    // console.log("userinfo = ", userinfo);
    let referralCodeAlreadyUsed = false;
    if (
        userinfo.referralCode !== null &&
        userinfo.referralCode !== undefined &&
        userinfo.referralCode &&
        userinfo.referralCode.length > 0
    ) {
        referralCodeAlreadyUsed = true;
    }

    const teamTable = require("../models/Team");
    let teams = await teamTable.find().lean();
    const context = {
        authenticated: req.isAuthenticated(),
        teams: teams,
        invalidCode: false,
        inviteCode: 0,
        allowedTeamSize: true,
        isPerson: "true",
        referralCodeUsed: referralCodeAlreadyUsed.toString(),
        refCode: referralCodeAlreadyUsed ? userinfo.referralCode : "nullvoid",
    };

    if (teams.length === 0) {
        // console.log("No teams formed till now!, teams = ", teams);
        res.render("submit", { ...context, user: req.session.user });
    } else {
        res.render("submit", { ...context, user: req.session.user });
    }
});

router.post("/joinTeam", authCheck, async (req, res) => {
    const userinfo = await userDetails(req.user._id);
    // console.log("userinfo = ", userinfo);
    let referralCodeAlreadyUsed = false;
    if (
        userinfo.referralCode !== null &&
        userinfo.referralCode !== undefined &&
        userinfo.referralCode &&
        userinfo.referralCode.length > 0
    ) {
        referralCodeAlreadyUsed = true;
    }
    const allowedTeamSize = await maxteamSize(req);
    if (allowedTeamSize === "true") {
        const inviteCode = await joinTeam(req);
        if (inviteCode != null) {
            const team_id = inviteCode.team;
            const teamTable = require("../models/Team");
            const team = await teamTable.findOne({ _id: team_id }).lean();
            const event_id = team.event;

            const event = await findEventFromId(event_id);
            // const eventTable = require('./models/Events');
            // await eventTable.updateOne(
            //     { _id: event._id },
            //     { $push: { registeredUsers : { user_id : req.user._id } } }
            // );
            const {
                referralCode,
                phone_number,
                fullName,
                collegeName,
                degree,
                branch,
            } = req.body;
            // const userinfo = await userDetails(req.user._id);
            const userTable = require("../models/User");
            await userTable.updateOne(
                { _id: req.user._id },
                {
                    phoneNumber: phone_number,
                    fullName: fullName,
                    collegeName: collegeName,
                    degree: degree,
                    branch: branch,
                    referralCode: referralCode,
                    referralCodeUsed: referralCodeAlreadyUsed.toString(),
                    refCode: referralCodeAlreadyUsed
                        ? userinfo.referralCode
                        : "nullvoid",
                }
            );
            res.redirect(`/event?event=${event.name}`);
        } else {
            // console.log("inviteCode is invalid");
            const teamTable = require("../models/Team");
            let teams = await teamTable.find().lean();
            const context = {
                authenticated: req.isAuthenticated(),
                teams: teams,
                invalidCode: true,
                inviteCode: req.body.invite_code.length,
                allowedTeamSize: true,
                isPerson: "true",
                referralCodeUsed: referralCodeAlreadyUsed.toString(),
                refCode: referralCodeAlreadyUsed
                    ? userinfo.referralCode
                    : "nullvoid",
            };
            // res.redirect(`/joinTeam`);
            res.render("submit", { ...context, user: req.session.user });
        }
    } else if (allowedTeamSize === "false") {
        // console.log("allowedTeamSize is false");
        const teamTable = require("../models/Team");
        let teams = await teamTable.find().lean();
        const context = {
            authenticated: req.isAuthenticated(),
            teams: teams,
            invalidCode: false,
            inviteCode: req.body.invite_code.length,
            allowedTeamSize: false,
            isPerson: "true",
            referralCodeUsed: referralCodeAlreadyUsed.toString(),
            refCode: referralCodeAlreadyUsed
                ? userinfo.referralCode
                : "nullvoid",
        };
        // res.redirect(`/joinTeam`);
        res.render("submit", {
            ...context,
            user: req.session.user,
        });
    } else {
        // console.log("inviteCode is true");
        const teamTable = require("../models/Team");
        let teams = await teamTable.find().lean();
        const context = {
            authenticated: req.isAuthenticated(),
            teams: teams,
            invalidCode: true,
            inviteCode: req.body.invite_code.length,
            allowedTeamSize: true,
            isPerson: "true",
            referralCodeUsed: referralCodeAlreadyUsed.toString(),
            refCode: referralCodeAlreadyUsed
                ? userinfo.referralCode
                : "nullvoid",
        };
        // res.redirect(`/joinTeam`);
        res.render("submit", {
            ...context,
            user: req.session.user,
        });
    }
});

router.get("/createTeam", authCheck, regCheck, async (req, res) => {
    const event = await findEvent(req);
    const context = {
        event: event,
        authenticated: req.isAuthenticated(),
        uniqueTeam: true,
    };
    res.render("createTeam", { ...context, user: req.session.user });
});

router.post("/createTeam", authCheck, async (req, res) => {
    const event = await findEvent(req);
    const uniqueTeam = await checkTeamName(req);
    // console.log("checkTeamName = ", uniqueTeam);
    if (!uniqueTeam) {
        const context = {
            event: event,
            authenticated: req.isAuthenticated(),
            uniqueTeam: uniqueTeam.toString(),
        };
        // res.redirect(`/joinTeam`);
        res.render("createTeam", {
            ...context,
            user: req.session.user,
        });
    } else {
        await createNewTeam(req);
        const event = await findEvent(req);
        context = {
            created: true,
        };

        res.redirect(`/event?event=${event.name}`);
    }
});

router.get("/deleteTeam", authCheck, async (req, res) => {
    const current_url = url.parse(req.url, true);
    const params = current_url.query;
    const teamTable = require("../models/Team");

    const event = await findEventFromId(params.event);
    if (event == null) {
        res.redirect(`/events`);
    } else {
        let team = await teamTable
            .findOne({ event: event._id, teamLeader: req.user._id })
            .lean();

        if (team != null) {
            await deleteTeam(params.team);
            res.redirect(`/event?event=${event.name}`);
        } else {
            // console.log("Only Team Leader can delete a team!");
            res.redirect(`/userTeam?event=${event.name}`);
        }
    }
});

router.get("/removeMember", authCheck, async (req, res) => {
    await removeMember(req);
    const team = await findUserTeamFromId(req);
    const event = await findEventFromId(team.event);
    res.redirect(`/userTeam?event=${event.name}`);
});

router.get("/userTeam", authCheck, async (req, res) => {
    const team = await findUserTeam(req);
    if (team == null) {
        res.redirect("/events");
    } else {
        const inviteCodeTable = require("../models/InviteCode");
        let inviteCode = await inviteCodeTable
            .findOne({ team: team._id })
            .lean();

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
    }
});

module.exports = router;
