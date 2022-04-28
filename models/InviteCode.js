const mongoose = require("mongoose");

const InviteCodeSchema = new mongoose.Schema({
    team: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    validUpto: {
        type: Date,
        required: true,
<<<<<<< HEAD
    }
});


=======
    },
});

>>>>>>> 19f2d6e11442867e83bf3d3910e3ecd9f08a6f12
module.exports = mongoose.model("InviteCode", InviteCodeSchema);
