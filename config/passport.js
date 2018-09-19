const passport = require('passport');
const request = require('request');
const {Strategy: LocalStrategy} = require('passport-local');
const {OAuthStrategy} = require('passport-oauth');
const {OAuth2Strategy} = require('passport-oauth');

const User = require('../models/User');


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    User.findOne({email: email.toLowerCase()}, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {msg: `Email ${email} not found.`});
        }
        user.comparePassword(password, (err, isMatch) => {
            if (err) {
                return done(err);
            }
            if (isMatch) {
                return done(null, user);
            }
            return done(null, false, {msg: 'Invalid email or password.'});
        });
    });
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

const adminPath = [{path : "/signup"}, {path: "/event/feedback"}, {path: "/event/game"}];
exports.isAuthorizedToAcces = (req, res, next) => {
    if (req.isAuthenticated()) {
        console.log(req.user + req.path.toString());
        if ((req.user.role === "Maître" || req.user.role === "admin"))  {
            return next();
        }
        else {
            console.log("redicrect");
            res.redirect("/")
        }
    }
    else {
        console.log("redirect");
        res.redirect("/login")
    }
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
    const provider = req.path.split('/').slice(-1)[0];
    const token = req.user.tokens.find(token => token.kind === provider);
    if (token) {
        next();
    }
    else {
        res.redirect(`/auth/${provider}`);
    }
};


