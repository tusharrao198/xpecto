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

        var user_id = String(req.user._id);
        var created_teams = await teamTable
            .find({ teamLeader: req.user._id })
            .lean();
        // console.log("created_teams",created_teams)
        var joined_teams = await teamTable.find({
            members: {
                $elemMatch: {
                    member_id: user_id,
                },
            },
        });

        // pushing important details in the queried data

        var registeredEvs = [];
        for (let i = 0; i < created_teams.length; i++) {
            let x = created_teams[i];
            let n = x.name;

            const event = await events.findOne({ _id: x.event }).lean();

            created_teams[i]["eventName"] = event.name;
            registeredEvs.push({ ...event, teamName: n });
        }

        for (let i = 0; i < joined_teams.length; i++) {
            let x = joined_teams[i];
            let n = x.name;

            const event = await events.findOne({ _id: x.event }).lean();

            joined_teams[i]["eventName"] = event.name;
            registeredEvs.push({ ...event, teamName: n });
        }

        return {
            joined_teams: joined_teams,
            created_teams: created_teams,
            registeredevents: registeredEvs,
        };
    },
    // findIfUserRegistered: async function(req){
    //     const eventDetails = await module.exports.allEventDetails(req);
    //     const event = await module.exports.findEvent(req);
    //     console.log(eventDetails);
    //     console.log(event);
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

            if (inviteCode.validUpto < Date.now()) inviteCode = null;

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
        var characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * charactersLength)
            );
        }
        return result;
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
};
