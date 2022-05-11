const mongoose = require("mongoose");

const updatesSchema = new mongoose.Schema({
	first: {
		type: String,
	},
	// link_text
	link_text: {
		type: String,
	},
	third: {
		type: String,
	},
	link: {
		type: String,
	},
});

module.exports = mongoose.model("updates", updatesSchema);
