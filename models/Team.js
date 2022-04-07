const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
    event:{
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    teamLeader:{
        type: String,
        required: true,
    },
    members:{
        type: Array
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("team", TeamSchema);
