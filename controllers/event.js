const EventGame = require("../models/Event");
const EventPlayers = require("../models/Event");

const gifts = {
    "roulage": 3,
    "vin": 4,
    "nourriture": 4
};


exports.getEvents = (req, res, next) => {
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
    EventGame.update({_id : req.body.id}, {
        $push : {players : eventPlayer} ,
        $inc : {playerComing : 1} },
        function (err, tank) {
            if (err) return handleError(err);
                res.redirect("/event")
        });
};
exports.getFeedBackEvent = (req, res, next) => {
    const idEvent = req.params.game;
    EventGame.find({_id : idEvent}, (err, event) => {
        console.log("event finded : " + event);
        if (err) return err;
        res.render('feedbackEvent', {usersEvent : event.players, gameDescription : event})
    })
};


exports.getFeedBackGeneral = (req, res, next) => {
    EventGame.find({status : {$eq : "DONE"}}, (err, event) => {
        if (err) return err;
        console.log("find : " + event);
        res.render('feedbackGeneral', {events : event})
    })
};

exports.postFeedBackEvent = (req, res, next) => {
  const idGame = req.body.id;
    console.log(req.body)
};

exports.getFinishGame = (req, res, next) => {
    console.log("finsih the game : " + req.params.game);
    EventGame.update({_id: req.params.game}, {
            status: "DONE"
        },
        function (err, tank) {
            if (err) return handleError(err);
            res.redirect("/event")
        });
}



