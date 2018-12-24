const passport = require('passport')
const mongoose = require('mongoose')
const _ = require('lodash')
const LocalStrategy = require('passport-local').Strategy
const Users = mongoose.model('users')

module.exports = function (passport) {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, (email, password, done) => {
        console.log(email, password)
        return Users.findOne({ email: email })
            .then(findRes => {
                if (_.isEmpty(findRes)) {
                    return done(null, false, { message: 'Invalid email' })
                } else {
                    if (findRes.password === password) {
                        return done(null, findRes)
                    } else {
                        return done(null, false, { message: 'Incorrect password' })
                    }
                }
            })
    }
    ));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        Users.findById(id).then(user => {
            done(null, user)
        })
    });
}