const EventGame = require("../models/Event");

const scales = {
    "week": 7,
    "month": 30
};



exports.getEvents = (req, res, next) => {
    var scale = scales[req.params.scale];
    var today = new Date();
    var nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const canManage = req.user.role === 'admin';
    console.log("can manage = " + canManage);
    var eventsOfTheWeek;
    EventGame.find({}, (err, events) => {
       console.log("all events : " + events)
    });

    EventGame.find({
            day : {$gte : today, $lte : nextWeek}
    }, function(err, events) {
        if (err) {return next(err)}
        console.log(events.lenght);
        events.forEach(event => console.log("Hey :" + event));
        console.log("events = " + events);
        eventsOfTheWeek = events;

        res.render("eventGame", {
            canManageCalendar: canManage,
            day : today.getDay().toString(),
            events: eventsOfTheWeek
        });
    });
};


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

        day: new Date(req.body.day),
        startHour: req.body.startHour,

        maxPlayer: req.body.maxPlayer,
        playerComing: 0,
        localisation: req.body.localisation,
        status: "IN CREATION",
        information: String,

        resume: null
    });

    console.log("I create " + newEvent);

    newEvent.save((err) => console.log(err));
    res.redirect("/event")
};