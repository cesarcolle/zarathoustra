/**
 * Module dependencies.
 */

const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');


const upload = multer({dest: path.join(__dirname, 'uploads')});

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({path: '.env'});

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const contactController = require('./controllers/contact');
const gameController = require("./controllers/game");
const eventController = require("./controllers/event");

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
    console.error(err);
    console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
    process.exit();
});


/**
 * Feed the DB with the admin user and a common user.
 */
const User = require('./models/User');

const user = new User({
    email: "user@user.com",
    password: "user",
    role: "pebron",
    score : 0
});

const admin = new User({
    email: "admin@admin.com",
    password: "admin",
    role: "admin",
    score : 0
});

const trueUser = new User({
   email : "caesar_14@hotmail.fr",
   password : "pmolik",
   role: "paysan",
   score : 10
});

admin.save((err) => {

});
user.save((err) => {
});

trueUser.save((err) => {
});

/**
 * Create authorisation
 * */
path.join(__dirname, 'public')
/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: {maxAge: 1209600000}, // two weeks in milliseconds
    store: new MongoStore({
        url: process.env.MONGODB_URI,
        autoReconnect: true,
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
    if (req.path === '/api/upload') {
        next();
    } else {
        lusca.csrf()(req, res, next);
    }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
app.use((req, res, next) => {
    // After successful login, redirect back to the intended page
    if (!req.user &&
        req.path !== '/login' &&
        req.path !== '/signup' &&
        !req.path.match(/^\/auth/) &&
        !req.path.match(/\./)) {
        req.session.returnTo = req.originalUrl;
    } else if (req.user &&
        (req.path === '/account' || req.path.match(/^\/api/))) {
        req.session.returnTo = req.originalUrl;
    }
    next();
});
app.use(express.static(path.join(__dirname, 'public'), {maxAge: 31557600000}));

/**
 * My proper API
 * */

app.get("/games", gameController.getGames);
app.post("/games/add", gameController.addGame);


/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);

app.get('/signup',passportConfig.isAuthorizedToAcces, userController.getSignup);
app.post('/signup',passportConfig.isAuthorizedToAcces, userController.postSignup);

app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);


app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

/**
 * Events
 * */

app.get("/event", passportConfig.isAuthenticated, eventController.getEvents);

app.get("/event/add", passportConfig.isAuthenticated, eventController.getAddEvents);
app.post("/event/add", passportConfig.isAuthenticated,eventController.addEvent);

app.get("/event/enroll/:game", passportConfig.isAuthenticated, eventController.getEnrollInTheEvent);
app.post("/event/enroll", passportConfig.isAuthenticated,eventController.postEnrollEvent);

app.get("/event/feedback", passportConfig.isAuthorizedToAcces, eventController.getFeedBackGeneral);
app.get("/event/feedback/:game", passportConfig.isAuthorizedToAcces, eventController.getFeedBackEvent);
app.get("/event/game/:game", passportConfig.isAuthorizedToAcces, eventController.getFinishGame);
app.post("/event/feedback", passportConfig.isAuthorizedToAcces, eventController.postFeedBackEvent);
/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
    // only use in development
    app.use(errorHandler());
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
