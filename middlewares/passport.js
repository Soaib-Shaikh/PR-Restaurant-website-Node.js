const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/userSchema');

passport.use(new LocalStrategy(
{
    usernameField: 'email',   // login email se hoga
    passwordField: 'password'
},
async (email, password, done) => {
    try {

        const user = await User.findOne({ email });

        if (!user) {
            return done(null, false, { message: 'Invalid email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return done(null, false, { message: 'Invalid password' });
        }

        return done(null, user);

    } catch (error) {

        return done(error, false);

    }
}));

// session store
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {

    try {

        const user = await User.findById(id);

        done(null, user);

    } catch (error) {

        done(error, null);

    }

});


// authentication middleware
passport.userAuth = (req, res, next) => {

    if (req.isAuthenticated()) {

        res.locals.user = req.user;

        return next();

    }

    return res.redirect('/login');

};

module.exports = passport;