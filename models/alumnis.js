const mongoose = require("mongoose");

const AlumniSchema = new mongoose.Schema({
	Name: {
		type: String,
		required: true,
	},
	Position: {
		type: String,
		required: true,
	},
	Linkedin: {
		type: String,
	},
	Instagram: {
		type: String,
	},
	Facebook: {
		type: String,
	},
	Twitter: {
		type: String,
	},
	Image_Link: {
		type: String,
	},
	ClassOf: {
		type: String,
	},
});

module.exports = mongoose.model("alumnis", AlumniSchema);
