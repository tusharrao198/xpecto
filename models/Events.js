const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    name: {
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
            default: 24
        },
        minutes: {
            type: Number,
            default: 0
        },
        seconds: {
            type: Number,
            default: 0
        },
    }
});

module.exports = mongoose.model("event", EventSchema);
