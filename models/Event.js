const mongoose = require('mongoose');


const PlayerResume = {
    emailPlayer: String,
    note: {type: Number, max: 5, min: 0},
    feedBack: String,
};

const EventResume = {
    playersResume: [PlayerResume],
    otherNote : String
};


const eventSchema = mongoose.Schema({
    nameOfEvent : String,
    day: Date,
    minimumGrade: String,
    gameName: String,
    playerInterest: Number,
    maxPlayer: Number,
    playerComing: Number,
    location: String,
    gamePlayed : String,
    status : String,
    information : String,
    startHour: {type: Number, max: 24, min: 0},
    endHour: {type: Number, max: 24, min: 0},
    resume : EventResume
});


const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
