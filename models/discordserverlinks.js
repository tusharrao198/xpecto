const mongoose = require("mongoose");

const discordserverlinksSchema = new mongoose.Schema({
	link: {
		type: String,
	},
});

module.exports = mongoose.model("discordserverlinks", discordserverlinksSchema);
