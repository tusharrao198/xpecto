var url = require("url");

module.exports = {
    findEvent: async function (req) {
        const current_url = url.parse(req.url, true);
        const params = current_url.query;

        const eventTable = require("./models/Events");
        const event = await eventTable.findOne({ name: params.event }).lean();
        return event;
    },
    findEventFromId: async function(event_id) {
        const eventTable = require("./models/Events");
        const event = await eventTable.findOne({ _id: event_id }).lean();
        return event;
    },
    findUserTeam: async function (req) {
        const event = await module.exports.findEvent(req);
        const teamTable = require("./models/Team");

        var team = await teamTable.findOne({ event: event._id, teamLeader: req.user._id }).lean();
        if(team == null)
            team = await teamTable.findOne({ members: req.user._id }).lean();

        return team;
    },
    findUserTeamFromId: async function(req){
        const current_url = url.parse(req.url, true);
        const params = current_url.query;

        const teamTable = require("./models/Team");
        const team = await teamTable.findOne({ _id: params.team }).lean();
        return team;
    },
    createNewTeam: async function(req){
        const formDetails = req.body;
        const teamTable = require("./models/Team");
        var newteam = new teamTable({
            event: formDetails.event_id,
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
    joinTeam: async function(req){
        const formDetails = req.body;
        const inviteCodeTable = require("./models/InviteCode");
        const inviteCode = await inviteCodeTable.findOne({ code: formDetails.invite_code }).lean();
        if(inviteCode != null){
            const teamTable = require("./models/Team");
            await teamTable.updateOne(
                { _id: inviteCode.team },
                { $push: { members: req.user._id }}
            );
            const team = await teamTable.findOne({_id: inviteCode.team}).lean();
            console.log(team);
        }
    },
    deleteTeam: async function(team_id){
        const teamTable = require("./models/Team");
        await teamTable.deleteOne({ _id:team_id });
    },
    generateString: async function(length) {
        let result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },
    deleteOldInviteCode: async function(req){
        const inviteCodeTable = require("./models/InviteCode");
        const team = await module.exports.findUserTeamFromId(req);
        await inviteCodeTable.deleteOne({team:team._id});
    },
    createNewInviteCode: async function(req){
        const team = await module.exports.findUserTeamFromId(req);
        const inviteCodeTable = require("./models/InviteCode");
        var newInviteCode = new inviteCodeTable({
            team: team._id,
            code: await module.exports.generateString(20),
            validUpto: new Date(Date.now() + 10*60000)
        });
        newInviteCode.save(function (err) {
            if (err) {
                console.log(err.errors);
                return err;
            }
        });
    }
};
