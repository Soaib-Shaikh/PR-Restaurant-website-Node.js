const Reservation = require('../models/reservationSchema');

const reserveTable = async (req, res, next) => {
    if (req.user) {
        try {
            const reservations = await Reservation.find({ user: req.user._id })
                .populate('restaurant')
                .sort({ date: -1 })
                .lean();

            res.locals.userReservations = reservations;
        } catch (error) {
            console.error('Failed to load reservations for header:', error);
            res.locals.userReservations = [];
        }
    }
    else{
        res.locals.userReservations = [];
    }
    next();
}

module.exports = reserveTable;