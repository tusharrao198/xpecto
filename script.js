const mongoose = require("mongoose");
require("dotenv").config({ path: "./config/config.env" });
const connectDB = require("./config/db");

// connect to Database
connectDB();

const allTeams = require("./models/Team");
const allEvents = require("./models/Events");
const userDetails = require("./models/User");

async function work()
{
    var teams = await allTeams.find();
    console.log("Hi\n");
    console.log(teams);
    for(var i=0;i<teams.length;i++)
    {
        var allMembers = [];
        const eventID = teams[i].event;
        const event = await allEvents.findOne({_id : eventID}).lean();
        const eventName = event.name;
        const teamName = teams[i].name;
        var members = teams[i].members;
        var leaderID = teams[i].teamLeader;
        for(var j=0;j<members.length;j++)
        {
            const userID=members[j].member_id;
            var user = await userDetails.findOne({_id: userID});
            const userData = {
                "Name" : user.displayName,
                "Email" : user.email,
                "PhNo." : user.phoneNumber
            }
            allMembers.push(userData);
        }
        var leader = await userDetails.findOne({_id: leaderID});
        const leaderData = {
            "Name" : leader.displayName,
            "Email" : leader.email,
            "PhNo." : leader.phoneNumber
        }
        console.log("Event -> ",eventName, "\nTeam -> ",teamName,"\nLeader -> ",leaderData,"\nmembers -> \n",allMembers);
    }
}

work();