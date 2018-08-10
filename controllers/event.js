const EventGame = require("../models/Event");

const scales = {
    "week": 7,
    "month": 30
};

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

    EventGame.find({day: {$gte: new Date(), $lte: nextWeek}}, function (err, events) {
        if (err) {
            return next(err)
        }
        events.forEach(event => {
            console.log("I push from event to week");
            week[event.day.getDay()].events.push(event);
        });
        const eventWeek = [];
        Object.keys(week).forEach(weekDay => {
            console.log(week[weekDay].date + " " + week[weekDay].events.length);
            if (week[weekDay].events.length > 0){
                console.log("I push element...");
                eventWeek.push(week[weekDay]);

            }
        });


        res.render("eventGame", {
            canManageCalendar: canManage,
            day: today.getDay().toString(),
            eventsOfWeek: eventWeek
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
    console.log("I receive the date as " + req.body.day + " it became :: " + new Date(req.body.day));
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

        resume: []
    });

    console.log("I create " + newEvent);

    newEvent.save((err) => console.log(err));
    res.redirect("/event")
};
exports.enrollInTheEvent = (req, res, next) => {

};


exports.enrollEvent = (req, res, next) => {


};




