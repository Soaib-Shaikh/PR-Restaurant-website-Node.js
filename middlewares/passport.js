const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/userSchema');

passport.use(new LocalStrategy(
    { usernameField: 'username' },
    async (username, password, done) => {
        try {
            const user = await User.findOne({ username });
            if (!user) return done(null, false, { message: 'Invalid username' });

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return done(null, false, { message: 'Invalid password' });

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// User authentication middleware
passport.userAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
        return next();
    }
    return res.redirect('/login');
};

module.exports = passport;
