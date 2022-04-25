const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
    event: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        unique: true, // team name must be unique
    },
    teamLeader: {
        type: String,
        required: true,
    },
    members: [
        {
            member_id: {
                type: String,
                required: true,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("team", TeamSchema);
