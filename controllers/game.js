require("http")
const boardGeekAPI = process.env.BOARDGEEK_URL
const Game = require('../models/Game');


exports.getGames = (req, res) => {
    res.render('game', {
        title: 'Game'
    });
};


exports.addGame = (req, res) => {
    console.log("add game controller");
    const gameCreated = new Game({
        info : {
            name : req.nameGame,
            price : req.price
        }
    });
    console.log(gameCreated.find({name : a }, callback));
     
    req.flash('success', { msg: 'You add properly the new game !' });
};