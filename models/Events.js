const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    club: {
        type: String,
        required: true,
    },
    info: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    content: {
        type: String,
        required: true,
    },
    event_image: {
        type: String,
        required: true,
    },
    rulebook_link: {
        type: String,
        required: true,
    },
    problemset_link: {
        type: String,
        required: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
    duration: {
        hours: {
            type: Number,
            default: 24,
        },
        minutes: {
            type: Number,
            default: 0,
        },
        seconds: {
            type: Number,
            default: 0,
        },
    },
});

module.exports = mongoose.model("event", EventSchema);
