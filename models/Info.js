const mongoose = require("mongoose");

const InfoSchema = new mongoose.Schema({
    first_para: {
        type: String,
        required: true,
    },
    second_para: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("homepageinfos", InfoSchema);
