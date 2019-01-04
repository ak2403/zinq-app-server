const mongoose = require('mongoose')
const _ = require('lodash')
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const Users = mongoose.model('users')

module.exports = function (passport) {
    passport.use(new GoogleStrategy({
        clientID: '802142740770-arughcgcbvu7bsb9aajic7l2deh97kn5.apps.googleusercontent.com',
        clientSecret: 'QCOEG3d5jsa_nn4UAQrR-v4q',
        callbackURL: '/auth/google/redirect'
      },
      function(token, tokenSecret, profile, done) {
          User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return done(err, user);
          });
      }
    ));
}