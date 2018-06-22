const https = require("https");
const boardGeekAPI = process.env.BOARDGEEK_URL;
const concat = require("concat-stream");
const Game = require('../models/Game');


function getBoardGeekGameXmlContent(name) {
    const https = require('https');

    const options = {
        hostname: 'boardgamegeek.com',
        port: 443,
        path: "/xmlapi/search?search=" + name,
        method: 'GET'
    };

    return https.get(options, (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);
        var output = '';
        res.on('data', (chunk) => {
            output += chunk
        });
        res.on('end', function() {
            return output;
        });

    }).on('error', (e) => {
        console.error(e);
    });
}

exports.getGames = (req, res) => {
    res.render('game', {
        title: 'Game'
    });
};


exports.addGame = (req, res) => {
    boardDescription = getBoardGeekGameXmlContent(req.body.name);
    console.log("RETURN :: "  + boardDescription.toString())
    const gameCreated = new Game({
        info: {
            name: req.body.nameGame,
            price: req.body.price
        }
    }).save();
    req.flash('success', {msg: 'You add properly the new game !'});
};