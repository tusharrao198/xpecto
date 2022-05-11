const mongoose = require("mongoose");

const webinarSchema = new mongoose.Schema({
	info: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
		unique: true,
	},
	webinar_image: {
		type: String,
		required: true,
	},
	webinar_link: {
		type: String,
		required: true,
	},
	description: [{ type: String }],
	webinar_benefits: [{ type: String }],
	speakers: [
		{
			name: { type: String },
			desc: { type: String },
			rest_desc: { type: String },
			duration: { type: String },
		},
	],
	createdAt: {
		type: Date,
		default: Date.now,
	},
	start_time: {
		day: {
			type: Number,
			required: true,
		},
		time: {
			type: String,
			required: true,
		},
	},
	end_time: {
		day: {
			type: Number,
			required: true,
		},
		time: {
			type: String,
			required: true,
		},
	},
	registeredUsers: [
		{
			user_id: {
				type: String,
				unique: true,
			},
		},
	],
});

module.exports = mongoose.model("webinars", webinarSchema);
