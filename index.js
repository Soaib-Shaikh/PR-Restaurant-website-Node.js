const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config({ quiet: true });
const db = require('./configs/db');
const flash = require('connect-flash');
const addFlash = require('./middlewares/flash');
const passport = require('./middlewares/passport');
const  reserveTable  = require('./middlewares/reservation');
const globalVars = require('./middlewares/globalVars')
const path = require('path');

const app = express();
const port = process.env.PORT || 8081;


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized:false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL}),
    cookie: { maxAge: 1000 * 60 * 60 * 24}
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(addFlash);

app.use(reserveTable)
app.use(globalVars)

app.use('/', require('./routers'))

app.listen(port, (err) =>{
    if(!err){
        db();
        console.log(`Server start -> http://localhost:${port}`);
        
    }
})