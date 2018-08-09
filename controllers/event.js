const EventGame = require("../models/Event")

const scales = {
    "week": 7,
    "month": 30
};

exports.getEvents = (req, res, next) => {
    var scale = scales[req.params.scale];
    var today = new Date();
    const canManage = req.user.role === 'admin';
    console.log(canManage);
    res.render("eventGame", {name: "that", canManageCalendar: canManage});
};




exports.addEvent = (req, res, next) => {
    const today = new Date();
    req.assert('nameName', 'the name of the game cannot be empty').notEmpty();
    // TODO : checking to be completed.
    const newEvent = new EventGame({
        nameOfEvent: req.name,
        day: req.date,
        minimumGrade: req.miniGrade,
        gameName: req.nameGame,
        maxPlayer: req.maxPlayer,
        playerComing: 0,
        location: req.address,
        status: "IN CREATION",
        information: String,
        startHour: req.startHour,
        endHour: req.endHour,
        resume: null
    });


    newEvent.save((err) => console.log(err));
    res.render("addEvent")
};