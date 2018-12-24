const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const _ = require('lodash')
const Users = mongoose.model('users')
let router = express.Router();

router.post('/add-user', (req, res) => {
    let data = req.body;
    console.log(data)
    return Users.addUser(data)
        .then(user => {
            res.status(200).json(user)
        })
        .catch(err => {
            res.status(400).json(err)
        })

});
















router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (user) {
            req.login(user, (err) => {
                if (err) {
                    res.send(err);
                }
                const returnUser = {
                    id: user._id,
                    username: user.username,
                    useremail: user.useremail,
                    company: user.company,
                    is_email_verified: user.is_email_verified,
                    is_company_added: user.is_company_added
                }
                const token = jwt.sign(JSON.stringify(returnUser), "123");
                Users.findByIdAndUpdate(user._id, {
                    $push: {
                        tokens: token
                    }
                }, {
                        new: true
                    })
                return res.status(200).json({ token });
            })
        } else {
            return res.status(400).json(info)
        }
    })(req, res, next);
})


module.exports = router;
