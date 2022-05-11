const mongoose = require("mongoose");
// this schema was to generate referral codes for campus ambassadors
// Not used right now
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
