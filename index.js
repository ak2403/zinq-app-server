const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config({ path: 'variables.env' })
const Users = require('./models/user')
const session = require('express-session')
const passport = require('passport');
// const MongoStore = require('connect-mongo')(session);
require('./routes/auth')(passport)
const ProtectedCheck = require('./routes/protected_route')
const user_route = require('./routes/user')

const app = express()

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
    .then(() => 'DB connected successfully')
    .catch(err => console.error(err))

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    // store: new MongoStore({
    //     url: process.env.MONGO_URI,
    //     autoReconnect: true
    // })
}))
app.use(passport.initialize());
app.use(passport.session());

app.use('/users', ProtectedCheck, user_route)

app.listen(process.env.PORT || '5000', () => {
    console.log('server running now...')
});