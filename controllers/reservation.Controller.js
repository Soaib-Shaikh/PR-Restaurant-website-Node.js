const Reservation = require('../models/reservationSchema');
const Restaurant = require('../models/restaurantSchema');

exports.reserveTablePage = async (req, res) => {
    try {
        const restaurants = await Restaurant.find({ isActive: true }).lean();
        return res.render('reservation/reserveTable', { restaurants, user: req.user });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Failed to load reservation page');
        return res.redirect('/');
    }
};

exports.reserveTable = async (req, res) => {
    try {
        const { restaurant, name, email, phone, date, time, guests } = req.body;

        // Validate fields
        if (!restaurant || !name || !email || !phone || !date || !time || !guests) {
            req.flash('error_msg', 'Please fill all fields');
            return res.redirect(req.get('Referrer') || '/reservation');
        }

        const newReservation = new Reservation({
            user: req.user._id,
            restaurant,
            name,
            email,
            phone,
            date,
            time,
            guests
        });

        await newReservation.save();
        req.flash('success_msg', 'Table reserved successfully!');

        // Redirect to confirmation page
        return res.redirect(`reserve/success/${newReservation._id}`);
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Reservation failed');
        return res.redirect(req.get('Referrer') || '/reservation');
    }
};

exports.reservationConfirm = async (req, res) => {
    try {
        const { id } = req.params;

        const reservation = await Reservation.findById(id)
            .populate('restaurant')
            .populate('user');

        if (!reservation) {
            req.flash('error_msg', 'Reservation not found.');
            return res.redirect(req.get('Referrer') || '/reservation');
        }

        return res.render('reservation/confirmReservation', { reservation, user: req.user });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Failed to load reservation confirmation');
        return res.redirect(req.get('Referrer') || '/reservation');
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        // Validate status
        if (!['pending','confirmed','cancelled'].includes(status)) {
            req.flash('error_msg', 'Invalid status');
            return res.redirect('back');
        }

        const reservation = await Reservation.findById(id);
        if (!reservation) {
            req.flash('error_msg', 'Reservation not found');
            return res.redirect('back');
        }

        reservation.status = status;
        await reservation.save();

        req.flash('success_msg', 'Reservation status updated!');
        res.redirect(req.get('Referrer') || '/reserve');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to update reservation status');
        res.redirect('back');
    }
};

exports.myReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.user._id })
            .populate('restaurant')
            .sort({ date: -1 })
            .lean();

        return res.render('reservation/myReservations', { reservations, user: req.user });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to load your reservations');
        return res.redirect('/');
    }
};
