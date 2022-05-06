const { create } = require("connect-mongo");
const { connect } = require("http2");
var url = require("url");

module.exports = {
    findEvent: async function (req) {
        const current_url = url.parse(req.url, true);
        const params = current_url.query;

        const eventTable = require("./models/Events");
        const event = await eventTable.findOne({ name: params.event }).lean();
        return event;
    },
    findEventFromId: async function (event_id) {
        const eventTable = require("./models/Events");
        const event = await eventTable.findOne({ _id: event_id }).lean();
        return event;
    },
    findUserTeam: async function (req) {
        const event = await module.exports.findEvent(req);
        const teamTable = require("./models/Team");
        var team = await teamTable
            .findOne({ event: event._id, teamLeader: req.user._id })
            .lean();

        var user_id = String(req.user._id);
        if (team == null)
            team = await teamTable.findOne({
                event: event._id,
                members: {
                    $elemMatch: {
                        member_id: user_id,
                    },
                },
            });

        return team;
    },
    allEventDetails: async function (req) {
        // const event = await module.exports.findEvent(req);
        const teamTable = require("./models/Team");
        const events = require("./models/Events");

        let user_id = String(req.user._id);

        let created_teams = await teamTable
            .find({ teamLeader: req.user._id })
            .lean();
        // console.log("created_teams",created_teams)
        let joined_teams = await teamTable.find({
            members: {
                $elemMatch: {
                    member_id: user_id,
                },
            },
        });

        let registered_events = await events.find({
            registeredUsers: {
                $elemMatch: {
                    user_id: user_id,
                },
            },
        });
        // console.log("registered_events = ", registered_events);

        // pushing important details in the queried data

        let registeredEvs = [];
        for (let i = 0; i < created_teams.length; i++) {
            let x = created_teams[i];
            let n = x.name;

            const event = await events.findOne({ _id: x.event }).lean();
            if (event === null || event === undefined) {
                created_teams[i]["eventName"] = null;
                registeredEvs.push({ ...event, teamName: n });
            } else {
                created_teams[i]["eventName"] = event.name;
                registeredEvs.push({ ...event, teamName: n });
            }
        }

        for (let i = 0; i < joined_teams.length; i++) {
            let x = joined_teams[i];
            let n = x.name;

            const event = await events.findOne({ _id: x.event }).lean();

            joined_teams[i]["eventName"] = event.name;
            registeredEvs.push({ ...event, teamName: n });
        }

        for (let i = 0; i < registered_events.length; i++) {
            let event_ = registered_events[i];
            let checkevent = false;
            for (let j = 0; j < registeredEvs.length; j++) {
                if (registeredEvs[j].name === event_.name) {
                    checkevent = true;
                    break;
                }
            }
            if (!checkevent) {
                // console.log("check = ", checkevent);
                // const event = await events.findOne({ _id: event_._id }).lean();
                registeredEvs.push({
                    ...event_._doc,
                    teamName: "nullvoidnoteampossible",
                });
            }
        }
        // console.log("registeredEvs = ", registeredEvs);
        return {
            joined_teams: joined_teams,
            created_teams: created_teams,
            registeredevents: registeredEvs,
        };
    },
    allTeamDetails: async function (req) {
        const teamTable = require("./models/Team");
        let team1 = await teamTable.find({ teamLeader: req.user._id }).lean();
        return team1;
    },
    // findIfUserRegistered: async function (req) {
    //     const eventDetails = await module.exports.allEventDetails(req);
    //     const teamDetails = await module.exports.allTeamDetails(req);
    //     if (teamDetails === null || teamDetails === undefined) {
    //         return false;
    //     }
    //     // const event = await module.exports.findEvent(req);
    //     // console.log("teamDetails = ", teamDetails);
    //     // console.log("userid = ", req.user._id, typeof req.user._id);

    //     for (let i = 0; i < teamDetails.length; i++) {
    //         if (
    //             teamDetails[i].teamLeader.toString() === req.user._id.toString()
    //         ) {
    //             return true;
    //             // if true that means user has created a team and have already filled the details.
    //         }
    //     }
    //     return false;
    // },
    findUserTeamFromId: async function (req) {
        const current_url = url.parse(req.url, true);
        const params = current_url.query;

        const teamTable = require("./models/Team");
        const team = await teamTable.findOne({ _id: params.team }).lean();
        return team;
    },
    createNewTeam: async function (req) {
        const event = await module.exports.findEvent(req);
        const formDetails = req.body;
        const teamTable = require("./models/Team");
        var newteam = new teamTable({
            event: event._id,
            name: formDetails.team_name,
            teamLeader: req.user._id,
        });
        newteam.save(function (err) {
            if (err) {
                console.log(err.errors);
                return err;
            }
        });

        // console.log(newteam)
    },
    joinTeam: async function (req) {
        const formDetails = req.body;
        // console.log("form = ", formDetails);
        // console.log(formDetails.invite_code);
        if (
            formDetails.invite_code === undefined ||
            formDetails.invite_code === null ||
            formDetails.invite_code === "" ||
            formDetails.invite_code == " "
        ) {
            return null;
        } else {
            const inviteCodeTable = require("./models/InviteCode");
            let inviteCode = await inviteCodeTable
                .findOne({ code: formDetails.invite_code })
                .lean();

            if (inviteCode && inviteCode.validUpto < Date.now())
                inviteCode = null;

            if (inviteCode != null) {
                const teamTable = require("./models/Team");
                const member_team = await teamTable.findOne({
                    _id: inviteCode.team,
                    members: {
                        $elemMatch: {
                            member_id: req.user._id,
                        },
                    },
                });
                const leader_team = await teamTable.findOne({
                    _id: inviteCode.team,
                    teamLeader: req.user._id,
                });
                // if a user is not in a team and not a leader
                if (member_team == null && leader_team == null) {
                    const team_id = inviteCode.team;
                    const teamTable = require("./models/Team");
                    const team = await teamTable
                        .findOne({ _id: team_id })
                        .lean();
                    const event_id = team.event;
                    const event = await module.exports.findEventFromId(
                        event_id
                    );

                    let all_reg = await module.exports.allowRegistration(
                        req,
                        event
                    );
                    // console.log("To allow user", all_reg);
                    // console.log("Type is ", typeof all_reg);
                    if (all_reg) {
                        // console.log("Mai ghus gya", all_reg);
                        const eventTable = require("./models/Events");
                        await eventTable.updateOne(
                            { _id: event._id },
                            {
                                $push: {
                                    registeredUsers: {
                                        user_id: req.user._id,
                                    },
                                },
                            }
                        );
                        await teamTable.updateOne(
                            { _id: inviteCode.team },
                            {
                                $push: {
                                    members: {
                                        member_id: req.user._id,
                                    },
                                },
                            }
                        );
                    }
                }
            }
            return inviteCode;
        }
    },
    deleteTeam: async function (team_id) {
        const teamTable = require("./models/Team");
        await teamTable.deleteOne({ _id: team_id });
    },
    removeMember: async function (req) {
        const current_url = url.parse(req.url, true);
        const params = current_url.query;

        const teamTable = require("./models/Team");

        const status = await teamTable.findOneAndUpdate(
            { _id: params.team },
            { $pull: { members: { member_id: params.member } } }
        );
        // console.log("84 -> status",status);
    },
    generateString: async function (length) {
        let result = "";
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * charactersLength)
            );
        }
        return result;
    },
    saveReferralCode: async function (req, code) {
        const codeTable = require("./models/code");
        const { campus_ambassador_name, place } = req.body;
        const person_name = campus_ambassador_name
            .split(" ")
            .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
            .join(" ");

        const person_palce = place
            .split(" ")
            .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
            .join(" ");

        const data = {
            campus_ambassador_name: person_name,
            place: person_palce,
            code: code,
            used: 0,
        };

        try {
            let codedata = await codeTable
                .findOne({ code: referralCode })
                .lean();
            // console.log("found_data = ", found_data);

            if (found_data) {
                // console.log("Already present!");
                done(null, codedata);
                return false;
            } else {
                codedata = await codeTable.create(data);
                done(null, codedata);
                return true;
            }
        } catch (err) {
            console.error(err);
        }
    },
    deleteOldInviteCode: async function (req) {
        const inviteCodeTable = require("./models/InviteCode");
        const team = await module.exports.findUserTeamFromId(req);
        await inviteCodeTable.deleteOne({ team: team._id });
    },
    createNewInviteCode: async function (req) {
        const team = await module.exports.findUserTeamFromId(req);
        const inviteCodeTable = require("./models/InviteCode");
        var newInviteCode = new inviteCodeTable({
            team: team._id,
            code: await module.exports.generateString(20),
            validUpto: new Date(Date.now() + 10 * 60000),
        });
        newInviteCode.save(function (err) {
            if (err) {
                console.log(err.errors);
                return err;
            }
        });
        // console.log(newInviteCode);
    },
    userDetails: async function (user_id) {
        const User = require("./models/User");
        let userinfo = await User.findOne({ _id: user_id }).lean();
        return userinfo;
    },
    regCheck: async function (req, res, next) {
        const event = await module.exports.findEvent(req);

        const eventTable = require("./models/Events");
        var registeredEvents = await eventTable.find({
            registeredUsers: {
                $elemMatch: {
                    user_id: req.user._id,
                },
            },
        });

        for (var i = 0; i < registeredEvents.length; i++) {
            var id1 = registeredEvents[i]._id;
            var id2 = event._id;
            if (id1.toString() == id2.toString()) return next();
        }
        res.redirect(`/eventRegister?event=${event.name}`);
    },
    allowRegistration: async function (req, event) {
        const teamTable = require("./models/Team");
        const member_team = await teamTable.find({
            members: {
                $elemMatch: {
                    member_id: req.user._id,
                },
            },
        });
        const leader_team = await teamTable.find({
            teamLeader: req.user._id,
        });

        let reg_events = [];
        for (let i = 0; i < member_team.length; i++) {
            reg_events.push(member_team[i].event);
        }
        for (let i = 0; i < leader_team.length; i++) {
            reg_events.push(leader_team[i].event);
        }

        // console.log("Ids are ", reg_events);
        // console.log("event to join is", event._id);
        let allow_reg = true;
        for (let i = 0; i < reg_events.length; i++) {
            if (reg_events[i] === event._id.toString()) allow_reg = false;
        }
        return allow_reg;
    },
    maxteamSize: async function (req) {
        // console.log("else mein a gya");
        const formDetails = req.body;
        if (
            formDetails.invite_code === undefined ||
            formDetails.invite_code === null ||
            formDetails.invite_code === "" ||
            formDetails.invite_code == " "
        ) {
            return "invalidCode";
        }
        const inviteCodeTable = require("./models/InviteCode");
        let inviteCode = await inviteCodeTable
            .findOne({ code: formDetails.invite_code })
            .lean();
        if (inviteCode != null) {
            const team_id = inviteCode.team;
            const teamTable = require("./models/Team");

            const member_team = await teamTable.findOne({
                _id: inviteCode.team,
                members: {
                    $elemMatch: {
                        member_id: req.user._id,
                    },
                },
            });
            const leader_team = await teamTable.findOne({
                _id: inviteCode.team,
                teamLeader: req.user._id,
            });

            const team = await teamTable.findOne({ _id: team_id }).lean();
            const event_id = team.event;
            const event = await module.exports.findEventFromId(event_id);

            let teamMaxSize = event.teamMaxSize;
            // if (teamMaxSize === "any") {
            //     teamMaxSize = 3;
            //     console.log("teamsize update due to any = ", teamMaxSize);
            // }

            // console.log("member_team = ", member_team);
            let teamSizeCount = 1;
            if (member_team != null) {
                teamSizeCount += member_team.members.length;
            }
            if (leader_team != null) {
                teamSizeCount += 1; // counting leader
            }
            // console.log(teamSizeCount);
            if (teamSizeCount >= teamMaxSize) {
                // context = {
                //     teamSizeCount: teamSizeCount,
                //     msg: `Only maximum of ${event.teamSizeCount} can participate in a team`,
                // };
                // console.log("FFFF");
                return "false";
            }
            // console.log("TRUEEE");
            return "true";
        }
    },
    checkTeamName: async function (req) {
        const { team_name } = req.body;
        if (
            team_name == null ||
            team_name == undefined ||
            team_name == "" ||
            team_name === " "
        ) {
            return false;
        }
        const teamTable = require("./models/Team");
        const allTeams = await teamTable.find().lean();
        let uniqueTeam = true;
        for (let i = 0; i < allTeams.length; i++) {
            if (allTeams[i].name === team_name.toString()) {
                uniqueTeam = false;
                // console.log("team not unique");
                break;
            }
        }
        return uniqueTeam;
    },
    homepageInfo: async function () {
        const Info = require("./models/Info");
        let info = await Info.find().lean();
        return info;
    },
    sponsorsInfo: async function () {
        const sponInfo = require("./models/Sponsors");
        let info = await sponInfo.find().lean();
        return info;
    },
    FAQInfo: async function () {
        const faqInfo = require("./models/Faq");
        let info = await faqInfo.find().lean();
        return info;
    },
    registrationdifferentiate: async function (regdata) {
        let not_college_count = 0;
        for (let i = 0; i < regdata.length; i++) {
            if (regdata[i].email.match("@students.iitmandi.ac.in") == null) {
                not_college_count += 1;
            }
        }
        return not_college_count;
    },
    numberofReg_referCode: async function () {
        const refferalCodes = require("./models/referralcodes");
        const User = require("./models/User");
        let regdata = await User.find().lean();

        let refercodedata = await refferalCodes.find().lean();

        let referdata = [];
        for (let i = 0; i < refercodedata.length; i++) {
            let regcnt = 0;
            for (let j = 0; j < regdata.length; j++) {
                if (
                    regdata[j].referralCode === null ||
                    regdata[j].referralCode === undefined
                ) {
                    // console.log("Continue");
                    continue;
                } else {
                    if (
                        regdata[j].referralCode.toUpperCase() ===
                        refercodedata[i].code.toUpperCase()
                    ) {
                        regcnt += 1;
                    }
                }
            }
            let addd = {
                count: regcnt,
                name: refercodedata[i].name,
                referralCode: refercodedata[i].code,
            };
            referdata.push(addd);
        }

        // sorting data
        referdata.sort((a, b) => {
            return b.count - a.count;
        });

        let totalreg = 0;
        for (let i = 0; i < referdata.length; i++) {
            totalreg += referdata[i].count;
        }
        // console.log("totalreg = ", totalreg);
        return [referdata, totalreg];
    },
    isRegisteredforEvent: function (user, event) {
        // isRegisteredforEvent means User has signed in and register for event
        let checker = false;
        if (user != null) {
            for (let j = 0; j < event.registeredUsers.length; j++) {
                if (event.registeredUsers[j].user_id.toString() == user._id) {
                    checker = true;
                }
            }
        }
        return checker;
    },
    isRegistered: function (user, events) {
        // isRegistered means User has signed in.
        let checker = [];
        for (let i = 0; i < events.length; i++) {
            checker.push(false);

            if (user == null) continue;
            for (let j = 0; j < events[i].registeredUsers.length; j++) {
                if (
                    events[i].registeredUsers[j].user_id.toString() == user._id
                ) {
                    checker[i] = true;
                }
            }
        }
        return checker;
    },
};
