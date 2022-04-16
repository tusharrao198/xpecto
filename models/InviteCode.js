const mongoose = require("mongoose");

const InviteCodeSchema = new mongoose.Schema({
    team: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    validUpto: {
        type: Date,
        required: true,
    }
});


module.exports = mongoose.model("InviteCode", InviteCodeSchema);
