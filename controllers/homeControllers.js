const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const sendMail = require('../middlewares/sendMail');
const Restaurant = require('../models/restaurantSchema')
const Menu = require('../models/menuSchema')

exports.homePage = async (req, res) => {
    try {
        // Restaurants fetch
        const restaurants = await Restaurant.find({ isActive: true })
            .sort({ createdAt: -1 })
            .populate('createdBy', 'username');

        // Categories
        const categories = ['Indian', 'Chinese', 'Italian', 'Mexican', 'Cafe'];

        // Category-wise menu preview (ek menu per category)
        const menusByCategory = {};
        for (const cat of categories) {
            const menu = await Menu.findOne({ category: cat })
                                   .populate('restaurant')
                                   .lean();
            menusByCategory[cat] = menu || null;
        }

        // Render EJS aur variables pass karo
        res.render('index', {  // agar file path index.ejs hai
            restaurants,
            categories,
            menusByCategory,
            user: req.user
        });

    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Something went wrong');
        res.redirect('/');
    }
};


exports.signupPage = (req, res) => {
    return res.render('pages/signup')
}

exports.loginPage = (req, res) => {
    return res.render('pages/login')
}


exports.signup = async (req, res) => {
    try {
        const { username, email, password} = req.body;

        // Existing user check
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash("error_msg", "Email already registered.");
            return res.redirect("/signup");
        }

        // Password hash
        const hashedPassword = await bcrypt.hash(password, 10);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        req.session.tempUser = {
            username,
            email,
            password: hashedPassword,
            otp,
            otpExpire: Date.now() + 10 * 60 * 1000
        }

        await sendMail(
            email,
            "Your OTP code",
            `<h2>Hello ${username},</h2>
             <p>Your OTP is:</p>
             <h1>${otp}</h1>
             <p>Valid for 10 minutes.</p>`
        )

        req.flash('success_msg', 'OTP sent to your email.');
        return res.render('pages/otpVerify');

    } catch (err) {
        console.error(err);
        req.flash("error_msg", "Something went wrong. Please try again.");
        return res.redirect(req.get('Referrer') || '/');
    }
};

exports.otpVerifyPage = (req, res) => {

    return res.render('pages/otpVerify')
}

exports.otpVerify = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const tempUser = req.session.tempUser;
        if (tempUser.otp !== otp || tempUser.otpExpire < Date.now()) {
            req.flash("error_msg", "Invalid or expired OTP.");
            return res.redirect("/otpVerify");
        }
        const newUser = await User.create({ ...tempUser })

        req.session.tempUser = null;
        req.flash("success_msg", "Email verified successfully. Please login.");
        if(newUser.role == 'admin'){
            return res.redirect('/admin/dashboard');
        }
        else{
            return res.redirect("/login");
        }
    }
    catch {
        console.log(error);
        req.flash("error_msg", "OTP verification failed.");
        return res.redirect(req.get('Referrer') || '/');
    }
}

exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            req.flash('error_msg', 'Logout failed, try again.');
            return res.redirect('/login');
        }
        req.flash('success_msg', 'Logged out successfully.');
        res.redirect('/login');
    });
};

exports.emailConfirmPage = (req, res) => {
    return res.render('pages/emailConfirm')
}

exports.emailConfirm = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (user) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = otp;
            user.otpExpire = Date.now() + 10 * 60 * 1000;
            await user.save();

            await sendMail(
                email,
                "Your OTP code",
                `<h2>Hello ${user.username},</h2>
                <p>Your OTP is:</p>
                <h1>${otp}</h1>
                <p>Valid for 10 minutes.</p>`
            );

            req.session.resetEmail = email;
            req.session.resetOtp = otp;

            req.flash('success_msg', 'OTP sent to your Email.')
            return res.redirect('/verifyOtp')
        }
        else {
            return res.redirect(req.get('Referrer') || '/');
        }
    } catch (error) {
        console.log(error);
        req.flash("error_msg", "OTP verification failed.");
        return res.redirect(req.get('Referrer') || '/');
    }
}

exports.verifyOtpPage = (req, res) => {
    return res.render('pages/verifyOtp')
}

exports.verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;

        const user = await User.findOne({ email: req.session.resetEmail });


        if (!user) {
            req.flash("error_msg", "User not found.");
            return res.redirect(req.get('Referrer') || '/')
        }

        if (req.session.resetOtp !== otp) {
            req.flash("error_msg", "Invalid OTP.");
            return res.redirect(req.get('Referrer') || '/')
        }
        await user.save();

        req.flash("success_msg", "OTP verified successfully!");
        return res.redirect("/newPassword");
    } catch (error) {
        console.log(error);
        req.flash("error_msg", "OTP verification failed.");
        return res.redirect(req.get('Referrer') || '/')
    }
}

exports.newPasswordPage = (req, res) => {
    return res.render('pages/newPassword')
}

exports.newPassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;

        if (newPassword == confirmPassword) {
            const user = await User.findOne({ email: req.session.resetEmail });

            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();

            req.session.resetEmail = null;

            req.flash('success_msg', 'Password change successfully! Please login.')
            return res.redirect('/login')
        }
        else {
            req.flash("error_msg", "NewPassword and ConfirmPassword not match.");
            return res.redirect(req.get('Referrer') || '/')
        }
    } catch (error) {
        console.log(error);
        req.flash("error_msg", "OTP verification failed.");
        return res.redirect(req.get('Referrer') || '/')
    }
}