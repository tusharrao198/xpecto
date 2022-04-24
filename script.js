const mongoose = require("mongoose");
require("dotenv").config({ path: "./config/config.env" });
const connectDB = require("./config/db");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// connect to Database
connectDB();

const allTeams = require("./models/Team");
const allEvents = require("./models/Events");
const userDetails = require("./models/User");

async function work()
{
    var teams = await allTeams.find();
    const csvWriter = createCsvWriter({
        path: 'TeamData.csv',
        header: [
            {id: 'eventName', title: 'Event Name'},
            {id: 'teamName', title: 'Team Name'},
            {id: 'leader', title: 'Leader'},
            {id: 'teamMembers', title: 'Team Members'}
        ]
    });
    var records = []
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
            allMembers.push(JSON.stringify(userData));
        }
        var leader = await userDetails.findOne({_id: leaderID});
        var leaderData = {
            "Name" : leader.displayName,
            "Email" : leader.email,
            "PhNo." : leader.phoneNumber
        }
        var leaderData = JSON.stringify(leaderData);
        
        const thisRecord = {
            "eventName" : eventName,
            "teamName" : teamName,
            "leader" : leaderData,
            "teamMembers" : allMembers
        }
        records.push(thisRecord);
    }
    csvWriter.writeRecords(records)       // returns a promise
        .then(() => {
            console.log('...Done');
    });
}

work();