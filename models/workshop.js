const mongoose = require("mongoose");

const WorkshopSchema = new mongoose.Schema({
	info: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
		unique: true,
	},

	oneline_content: {
		type: String,
		required: true,
	},

	rest_content: {
		type: String,
	},

	workshop_image: {
		type: String,
		required: true,
	},
	workshop_link: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
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
	prices: {
		first: {
			type: Number,
			required: true,
		},
		second: {
			type: String,
			required: true,
		},
		third: {
			type: String,
			required: true,
		},
	},
	speakers: [
		{
			name: { type: String },
			desc: { type: String },
			rest_desc: { type: String },
			duration: { type: String },
			image: { type: String },
		},
	],
	coordinators: {
		first: {
			name: {
				type: String,
				required: true,
			},
			contact: {
				type: String,
				required: true,
			},
		},
		second: {
			name: {
				type: String,
				required: true,
			},
			contact: {
				type: String,
				required: true,
			},
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

module.exports = mongoose.model("workshop", WorkshopSchema);
