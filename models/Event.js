const mongoose = require('mongoose');
const statusEvent = [ { "CREATED" : 1}, {"IN PROGRESS" : 2}, {"DONE" : 3}, {"FEEDBACKED" : 4}];


const EventPlayers = {
    email: String,
    nickname: String,
    role: String,
    note: {type: Number, max: 5, min: 0},
    feedBack: String,
    otherNote: String
};


const eventSchema = mongoose.Schema({
    nameOfEvent: String,
    day: Date,
    minimumGrade: String,
    gameName: String,
    playerInterest: Number,
    maxPlayer: Number,
    playerComing: Number,
    localisation: String,
    status: String,
    information: String,
    startHour: String,
    players: [EventPlayers]
});

const Event = mongoose.model('Event', eventSchema);


module.exports = EventPlayers;
module.exports = Event;
