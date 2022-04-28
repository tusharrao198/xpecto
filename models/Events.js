const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    club: {
        type: String,
        required: true,
    },
    info: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    content: {
        type: String,
        required: true,
    },
    event_image: {
        type: String,
        required: true,
    },
    rulebook_link: {
        type: String,
        required: true,
    },
    problemset_link: {
        type: String,
        required: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
    
    start_time: {
        day:{
            type:Number,
            required:true
        },
        time:{
            type:String,
            required:true   
        }
    },
    
    end_time: {
        day:{
            type:Number,
            required:true
        },
        time:{
            type:String,
            required:true   
        }
    },

    prices: {
        first:{
            type:Number,
            required:true
        },
        second:{
            type:String,
            required:true   
        },
        third:{
            type:String,
            required:true
        }
    },

    coordinators: {
        first:{
            name:{
                type:String,
                required:true
            },
            contact:{
                type:String,
                required:true
            }
        },
        second:{
            name:{
                type:String,
                required:true
            },
            contact:{
                type:String,
                required:true
            }
        },
    },

    // duration: {
    //     hours: {
    //         type: Number,
    //         default: 24,
    //     },
    //     minutes: {
    //         type: Number,
    //         default: 0,
    //     },
    //     seconds: {
    //         type: Number,
    //         default: 0,
    //     },
    // },
    
    registeredUsers: [
        {
            user_id: {
                type: String,
                required: true,
            }
        }
    ]
});

module.exports = mongoose.model("event", EventSchema);
