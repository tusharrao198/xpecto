const mongoose = require("mongoose");

const ReferralCodeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
});

module.exports = mongoose.model("refferalcodes", ReferralCodeSchema);
