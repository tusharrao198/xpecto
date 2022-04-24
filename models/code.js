const mongoose = require("mongoose");

const CodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    used: {
        type:Number,
        required:true,
    }
});

module.exports = mongoose.model("code", CodeSchema );
