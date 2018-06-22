const mongoose = require('mongoose');

const gameschema = new mongoose.Schema({
    info : {
        name: String,
        website: String,
        picture: String,
        description: String,
        price: Number,
        amountNeeded : Number,
        stock : 0
    }
}, {timestamps: true});


const Game = mongoose.model('Game', gameschema);

module.exports = Game;
