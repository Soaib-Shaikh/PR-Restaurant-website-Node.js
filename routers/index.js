const { Router } = require("express");
const passport = require('../middlewares/passport');
const userRoutes = require('../routers/userRoutes');
const restaurantRoutes = require('../routers/restaurantRoutes');
const menuRoutes = require('../routers/menuRoutes');
const reservationRoutes = require('../routers/reservationRoutes');
const adminRoutes = require('../routers/adminRoutes');
const orderRoutes = require('../routers/orderRoutes')

const { homePage, signupPage, signup, loginPage, logout } = require('../controllers/homeControllers');
const router = Router();

// Routers
router.use('/user', userRoutes);
router.use('/restaurant', restaurantRoutes);
router.use('/menu', menuRoutes);
router.use('/reserve', reservationRoutes);
router.use('/admin', adminRoutes);
router.use('/order', orderRoutes)


// Signup & Login
router.get('/signup', signupPage);
router.post('/signup', signup);

router.get('/login', loginPage);
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            req.flash('error_msg', info ? info.message : "Invalid credentials");
            return res.redirect('/login');
        }

        req.logIn(user, (err) => {
            if (err) return next(err);
            req.flash('success_msg', 'Login Successful');

            if (user.role === 'admin') return res.redirect('/admin/dashboard');
            return res.redirect('/');
        });
    })(req, res, next);
});

// User auth
router.use(passport.userAuth);

// Home & logout
router.get('/', homePage);
router.get('/logout', logout);

module.exports = router;
