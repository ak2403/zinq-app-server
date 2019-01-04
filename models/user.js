const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash')
const schema = mongoose.Schema;

const userSchema = new schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number
    },
    source: {
        type: String,
        default: 'self'
    },
    is_activated: {
        type: Boolean,
        default: true
    }
});

const handleError = err => {
    const dict = {
        'unique': "% already exists.",
        'required': "%s is required.",
        'min': "%s below minimum.",
        'max': "%s above maximum.",
        'enum': "%s is not an allowed value."
    }

    return Object.keys(err.errors).map(key => {
        const props = err.errors[key].properties
        return dict.hasOwnProperty(props.kind) ?
            require('util').format(dict[props.kind], props.path) :
            props.hasOwnProperty('message') ?
                props.message : props.type
    })
}

userSchema.statics.addUser = function (req) {
    return new Promise((resolve, reject) => {
        this.findOne({
            email: req.email
        }, (err, user) => {
            if (err) {
                console.log("64")
                console.log(err)
            }

            if (!user) {
                const newUser = new this(req)
                newUser.save()
                    .then(user => {
                        const returnUser = {
                            id: user._id,
                            firstname: user.firstname,
                            lastname: user.lastname,
                            phone: user.phone,
                            email: user.email,
                            is_activated: user.is_activated
                        }
                        resolve(returnUser)
                    })
                    .catch(err => {
                        reject(handleError(err))
                    })
            } else {
                const error_obj = {
                    message: 'Email already in use'
                }
                reject(error_obj)
            }
        })
    })
}

userSchema.statics.authGoogle = function (data) {
    return new Promise((resolve, reject) => {
        this.findOne({
            email: data.email
        }, (err, user) => {
            if (err) {
                console.log('err : ', err)
            }
            if (!user) {
                data['is_activated'] = true
                data['password'] = 'itsshouldberewriten'
                const newUser = new this(data)
                newUser.save()
                    .then(user => {
                        const returnUser = {
                            id: user._id,
                            firstname: user.firstname,
                            lastname: user.lastname,
                            email: user.email,
                        }
                        const token = jwt.sign(JSON.stringify(returnUser), "123");
                        resolve(token)
                    })
                    .catch(err => {
                        reject(handleError(err))
                    })
            }
            if (user) {
                if (user.source === 'self') {
                    reject({
                        message: 'Already registered through email'
                    })
                }else if(user.source === 'google'){
                    const returnUser = {
                        id: user._id,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        email: user.email
                    }
                    const token = jwt.sign(JSON.stringify(returnUser), "123");
                    resolve(token)
                }
            }

        })
    })
}

userSchema.statics.editUser = function (userID, data) {
    return new Promise((resolve, reject) => {
        this.findByIdAndUpdate(userID, data, { new: true }, function (err, user) {
            if (err) {
                reject(err)
            }
            resolve(user)
        })
    })
}

userSchema.statics.getUser = function (userID) {
    return new Promise((resolve, reject) => {
        this.findById(userID, 'firstname lastname email phone is_activated', function (err, user) {
            resolve(user)
        })
    })
}

const userModel = mongoose.model('users', userSchema);
module.exports = userModel;