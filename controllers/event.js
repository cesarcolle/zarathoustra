const EventGame = require("../models/Event");
const User = require('../models/User');

const gifts = {
    "roulage": 3,
    "vin": 4,
    "nourriture": 4
};


exports.getEvents = (req, res, next) => {


    newCategories(10);
    var today = new Date();
    const week = {
        0: {date: "", events: []},
        1: {date: "", events: []},
        2: {date: "", events: []},
        3: {date: "", events: []},
        4: {date: "", events: []},
        5: {date: "", events: []},
        6: {date: "", events: []},

    };

    const canManage = req.user.role === 'admin';
    today = new Date();
    // create the current week.
    for (let i = 0; i < 7; i++) {
        const theNewDay = new Date(today.setTime(today.getTime() + i * 86400000));
        week[theNewDay.getDay()].date = theNewDay;
        today = new Date();
    }

    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    EventGame.find({day: {$gte: new Date()}}, function (err, events) {
        if (err) {
            return next(err)
        }

        const inTheGame = {};
        // if the event is finished : events = events.filter(evnt => evnt.status != "DONE");
        events.forEach(event => {
            event.players.forEach(eventPlayer => {
                if (eventPlayer.email === req.user.email){
                    inTheGame[event._id] = true;
                }
            });
            week[event.day.getDay()].events.push(event);
        });
        const eventWeek = [];
        Object.keys(week).forEach(weekDay => {
            if ( week[weekDay].events.length > 0){
                eventWeek.push(week[weekDay]);
            }
        });


        res.render("eventGame", {
            canManageCalendar: canManage,
            day: today.getDay().toString(),
            eventsOfWeek: eventWeek,
            eventEnrolled : inTheGame
        });
    });
}
;


exports.getAddEvents = (req, res, next) => {
    res.render("addEvent");
};


exports.addEvent = (req, res, next) => {
    req.assert('name', 'the name of the game cannot be empty').notEmpty();
    req.assert('day', 'cannot provide empty date for the event').notEmpty();
    req.assert('startHour', 'your event have to start somehow').notEmpty();
    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/event/add');
    }
    // TODO : checking to be complete
    const newEvent = new EventGame({
        nameOfEvent: req.body.name,
        gameName : req.body.nameOfGame,
        day: new Date(req.body.day),
        startHour: req.body.startHour,

        maxPlayer: req.body.maxPlayer,
        playerComing: 0,
        localisation: req.body.localisation,
        status: "IN CREATION",
        information: req.body.information,
        players: []
    });
    newEvent.save((err) => console.log(err));
    res.redirect("/event")
};
exports.getEnrollInTheEvent = (req, res, next) => {
    EventGame.find({_id : req.params.game}, (err, event) => {
        if (err) return err;
        res.render('enroll', {eventId : req.params.game, eventEnrolled : event});
    });
};
exports.postEnrollEvent = (req, res, next) => {
    const eventPlayer = {
        email : req.user.email,
        nickname : req.user.nickname,
        role : req.user.role
    };
    EventGame.find({_id : req.body.id}, (err, event) => {
        if (event.players) {
            if (event.players.find(p => p.email === req.user.email)) {
                req.flash('bad', {msg: 'you cannot be enrolled twice ....'});
                res.redirect('/account');
            }
        }
    });
    EventGame.update({_id : req.body.id}, {

        $push : {players : eventPlayer} ,
        $inc : {playerComing : 1} },
        function (err, tank) {
            if (err) return handleError(err);
                res.redirect("/event")
        });
};
exports.getFeedBackGeneral = (req, res, next) => {
    EventGame.find({status : {$eq : "DONE"}}, (err, event) => {
        if (err) return err;
        res.render('feedbackGeneral', {events : event})
    })
};
exports.getFeedBackEvent = (req, res, next) => {
    const idEvent = req.params.game;
    EventGame.findOne({_id : idEvent}, (err, event) => {
        if (err) return err;
        console.log(event.players);
        res.render('feedbackEvent', {usersEvent : event.players, gameDescription : event})
    })
};

const rules = {
    7 : [8, 5, 2, 1,0, 0, -3],
    5 : [5, 2, 1,0, -1],
    6 : [5, 2, 1,0, -1, -2],
    4 : [4, 2, 1, -1],
    3 : [2, 1, -1],
    2 : [1, -1]};

const bonus = {
    "nothing" : 0,
    "taverne" : 1,
    "palais" : 2
};

const status = {
    "esclave" : -2,
    "coni" : 0,
    "golum" : 2,
    "gueux" : 4,
    "pebron" : 7,
    "paysan" : 10,
    "ecuyer" : 14,
    "adorateur" : 19,
    "eclaireur" : 24,
    "hoplite" : 30,
    "samourai" : 36,
    "padawan" : 42,
    "paladin" : 49,
    "seigneur" : 56,
    "maitre" : 75
};

function newCategories(gain) {
    return Object.keys(status)
        .map(s => Array(s, status[s]))
        .map(s => [s[0], s[1] - gain])
            .filter(s => s[1] <= 0)
        .map(s => [s[0], Math.abs(s[1])] )
        .reduce((prev, curr) => prev[1] < curr[1] ? prev : curr)[1]

}

exports.postFeedBackEvent = (req, res, next) => {
    console.log("POST FEEDBACK EVENT")
  const idGame = req.body.gameId;
  const idPlayer = req.body.playerId;
  const rank = req.body.rank;
  const maxplayer = req.body.playerGameNumber;
  const bonusPlayer = req.body.bonus;
  const scorePlayer = rules[maxplayer][rank] + bonus[bonusPlayer];
  console.log("find the user to update ..." + idPlayer);
  User.find({email : idPlayer}, (err, player) => {
      if (err) return err;
      var statusPlayer = player.status;
      const newScore = player.score + scorePlayer;
      console.log("new score : " + newScore);

      if (newScore < status["maitre"] && newScore >= 0){
          statusPlayer = newCategories(newScore)
      }
      console.log("Update score and change status ...");

      User.update({_id : idPlayer},{
          $incr : {score : scorePlayer},
          status : statusPlayer
      });
      console.log("remove the user from the game because his add feedback");
      // feedback provided.
      EventGame.update({_id : idGame}, {$pull : {players : {email : player.email}}});
      console.log("redirect to ");
      res.redirect("/event/feedback/")
  });
};

exports.getFinishGame = (req, res, next) => {
    EventGame.update({_id: req.params.game}, {
            status: "DONE"
        },
        function (err, tank) {
            if (err) return handleError(err);
            res.redirect("/event")
        });
};



