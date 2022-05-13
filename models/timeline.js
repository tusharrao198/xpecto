const mongoose = require("mongoose");

const TimelineSchema = new mongoose.Schema({
	date: {
		type: String,
		required: true,
	},
	schedule_day: {
		type: String,
		required: true,
	},
	info: [
		{
			schedule_date: {
				type: String,
			},
			schedule_event: {
				type: String,
			},
			schedule_time: {
				type: String,
			},
		},
	],
});

module.exports = mongoose.model("timelines", TimelineSchema);
