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
        const team = await teamTable
            .findOne({ event: event._id, teamLeader: req.user._id })
            .lean();
        return team;
    },
};
