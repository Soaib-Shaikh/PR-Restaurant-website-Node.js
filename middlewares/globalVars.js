const Restaurant = require('../models/restaurantSchema');
const Menu = require('../models/menuSchema');
const Reservation = require('../models/reservationSchema');

module.exports = async (req, res, next) => {
  try {
    // User reservations for dropdown
    if (req.user) {
      const userReservations = await Reservation.find({ user: req.user._id })
        .populate('restaurant')
        .lean();
      res.locals.userReservations = userReservations;
    } else {
      res.locals.userReservations = [];
    }

    // Menus for header dropdown
    const menusByCategory = await Menu.find().limit(10).lean(); // limit optional
    res.locals.menusByCategory = menusByCategory;

    next();
  } catch (err) {
    console.error('Global vars middleware error:', err);
    res.locals.userReservations = [];
    res.locals.menusByCategory = [];
    next();
  }
};
