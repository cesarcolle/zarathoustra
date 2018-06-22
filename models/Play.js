const mongoose = require('mongoose');


const playSchema = mongoose.Schema({
    when     : Date,
    duration : String,
    nbPlayers     : Int8Array,
    maxPlayer     : Int8Array,
    nameGame      : String,

    localisation  : String
});

const play = mongoose.model("Play", playSchema);

module.exports = play;