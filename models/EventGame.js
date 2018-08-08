const mongoose = require('mongoose');


const PlayerResume = mongoose.Schema({
    emailPlayer: String,
    note: {type: Number, max: 5, min: 0},
    feedBack: String,
    });

const EventResume = mongoose.Schema({
    playersResume : [PlayerResume]
});


const EventSchema = mongoose.Schema({
    day: String,
    minimumGrade: String,
    gameName: String,
    playerInterest: Number,
    maxPlayer: Number,
    playerComing: Number,
    location: String,

});