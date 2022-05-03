const mongoose = require("mongoose");

const SponsorsSchema = new mongoose.Schema({
    sponsor_name: {
        type: String,
        required: true,
    },
    spon_description: {
        type: String,
        required: true,
    },
    spon_imagelink: {
        type: String,
        required: true,
    },
    spon_sitelink: {
        type: String,
        required: true,
    },
    spon_type: {
        type: String,
        required: true,
    },
    spon_additionalinfo: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("sponsorsInfos", SponsorsSchema);
