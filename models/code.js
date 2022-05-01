const mongoose = require("mongoose");

const CodeSchema = new mongoose.Schema({
    campus_ambassador_name: {
        type: String,
        required: true,
    },
    place: {
        type: String,
        required: true,
        unique: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    used: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("code", CodeSchema);
