const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "team",
    },
    image: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        default: 0,
        required: true,
    },
    phoneNumber: {
        type: Number,
    },
});

module.exports = mongoose.model("UserDetails", UserSchema);
