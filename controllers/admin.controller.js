const Restaurant = require('../models/restaurantSchema');
const Menu = require('../models/menuSchema');
const Reservation = require('../models/reservationSchema');
const Chef = require('../models/chefSchema');
const User = require('../models/userSchema');

// ---------------- DASHBOARD ----------------
exports.adminDashboard = async (req, res) => {
    try {
        const totalRestaurants = await Restaurant.countDocuments();
        const totalMenus = await Menu.countDocuments();
        const totalReservations = await Reservation.countDocuments();
        const pendingReservations = await Reservation.countDocuments();
        const totalChefs = await Chef.countDocuments();
        const totalUsers = await User.countDocuments();
        res.render('admin/dashBoard', {
            user: req.user,
            totalRestaurants,
            totalMenus,
            totalReservations,
            pendingReservations,
            totalChefs,
            totalUsers
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to load dashboard');
        res.redirect('/');
    }
};

// 📌 List all reservations
exports.manageReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate('user')
            .populate('restaurant')
            .sort({ date: -1 })
            .lean();

        res.render('admin/reservations', {
            reservations,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to load reservations');
        res.redirect('/admin/dashboard');
    }
};

// 📌 Edit Reservation Page
exports.editReservationPage = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate('user')
            .populate('restaurant')
            .lean();

        if (!reservation) {
            req.flash('error_msg', 'Reservation not found');
            return res.redirect('/admin/reservations');
        }

        const restaurants = await Restaurant.find().lean();

        res.render('admin/editReservation', {
            reservation,
            restaurants,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to load reservation edit page');
        res.redirect('/admin/reservations');
    }
};

// Update reservation status
exports.updateReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await Reservation.findByIdAndUpdate(id, { status: status });

        req.flash('success_msg', 'Reservation status updated successfully');
        return res.redirect('/admin/reservations'); // redirect to the list page so new status shows
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to update reservation');
        return res.redirect('/admin/reservations');
    }
};

// 📌 Delete Reservation
exports.deleteReservation = async (req, res) => {
    try {
        await Reservation.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Reservation deleted successfully');
        res.redirect('/admin/reservations');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to delete reservation');
        res.redirect('/admin/reservations');
    }
};

// ---------------- RESTAURANTS CRUD ----------------
exports.listRestaurants = async (req, res) => {
    const restaurants = await Restaurant.find().lean();
    res.render('admin/restaurants', { restaurants, user: req.user });
};

exports.addRestaurantPage = (req, res) =>
    res.render('admin/addRestaurant', { restaurant: null, user: req.user });

exports.createRestaurant = async (req, res) => {
    try {
        const { name, address, cuisine, phone, email, description, openingHours, rating } = req.body;
        const image = req.file ? `/uploads/admin/${req.file.filename}` : "/uploads/restaurant-default.png";
        await Restaurant.create({
            name, address, cuisine, phone, email, description, openingHours, rating, image, createdBy: req.user._id
        });
        req.flash('success_msg', 'Restaurant added successfully');
        res.redirect('/admin/restaurants');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to add restaurant');
        res.redirect('/admin/restaurants');
    }
};

exports.editRestaurantPage = async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id).lean();
    res.render('admin/editRestaurant', { restaurant, user: req.user });
};

exports.updateRestaurant = async (req, res) => {
    try {
        const { name, address, cuisine, phone, email, description, openingHours, rating } = req.body;
        const updateData = { name, address, cuisine, phone, email, description, openingHours, rating };
        if (req.file) updateData.image = `/uploads/admin/${req.file.filename}`;
        await Restaurant.findByIdAndUpdate(req.params.id, updateData);
        req.flash('success_msg', 'Restaurant updated successfully');
        res.redirect('/admin/restaurants');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to update restaurant');
        res.redirect('/admin/restaurants');
    }
};

exports.deleteRestaurant = async (req, res) => {
    try {
        await Restaurant.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Restaurant deleted successfully');
        res.redirect('/admin/restaurants');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to delete restaurant');
        res.redirect('/admin/restaurants');
    }
};

// ---------------- MENUS CRUD ----------------
exports.listMenus = async (req, res) => {
    const menus = await Menu.find().populate('restaurant').lean();
    res.render('admin/menus', { menus, user: req.user });
};

exports.addMenuPage = async (req, res) => {
    const restaurants = await Restaurant.find().lean();
    res.render('admin/addMenu', { menu: null, restaurants, user: req.user });
};

exports.createMenu = async (req, res) => {
    try {
        const { restaurant, name, description, price, category } = req.body;
        const image = req.file ? `/uploads/admin/${req.file.filename}` : "/uploads/menu-default.png";
        await Menu.create({ restaurant, name, description, price, category, image, createdBy: req.user._id });
        req.flash('success_msg', 'Menu added successfully');
        res.redirect('/admin/menus');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to add menu');
        res.redirect('/admin/menus');
    }
};

exports.editMenuPage = async (req, res) => {
    const menu = await Menu.findById(req.params.id).lean();
    const restaurants = await Restaurant.find().lean();
    res.render('admin/editMenu', { menu, restaurants, user: req.user });
};

exports.updateMenu = async (req, res) => {
    try {
        const { restaurant, name, description, price, category } = req.body;
        const updateData = { restaurant, name, description, price, category };
        if (req.file) updateData.image = `/uploads/admin/${req.file.filename}`;
        await Menu.findByIdAndUpdate(req.params.id, updateData);
        req.flash('success_msg', 'Menu updated successfully');
        res.redirect('/admin/menus');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to update menu');
        res.redirect('/admin/menus');
    }
};

exports.deleteMenu = async (req, res) => {
    try {
        await Menu.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Menu deleted successfully');
        res.redirect('/admin/menus');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to delete menu');
        res.redirect('/admin/menus');
    }
};


exports.updateReservationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
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

        req.flash('success_msg', 'Reservation status updated');
        return res.redirect('/admin/reservations');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Something went wrong');
        return res.redirect('back');
    }
};


exports.listChefs = async (req, res) => {

    const chefs = await Chef.find();

    res.render("admin/chefList", { chefs, user: req.user });

};


exports.addChefPage = (req, res) => {

    res.render("admin/addChef", { user: req.user });

};

exports.createChef = async (req, res) => {

    const { name, speciality, experience } = req.body;

    let image = "";

    if (req.file) {
        image = "/uploads/admin/" + req.file.filename;
    }

    await Chef.create({
        name,
        speciality,
        experience,
        image
    });

    res.redirect("/admin/chefs");

};

exports.editChefPage = async (req, res) => {

    try {

        const chef = await Chef.findById(req.params.id);

        if (!chef) {
            req.flash('error_msg', 'Chef not found');
            return res.redirect('/admin/chefs');
        }

        res.render('admin/editChef', {
            chef,
            user: req.user
        });

    } catch (error) {

        console.log(error);
        res.redirect('/admin/chefs');

    }

};

exports.updateChef = async (req, res) => {

    try {

        const { name, speciality, experience } = req.body;

        const chef = await Chef.findById(req.params.id);

        if (!chef) {
            req.flash('error_msg', 'Chef not found');
            return res.redirect('/admin/chefs');
        }

        chef.name = name;
        chef.speciality = speciality;
        chef.experience = experience;

        if (req.file) {
            chef.image = "/uploads/admin/" + req.file.filename;
        }

        await chef.save();

        req.flash('success_msg', 'Chef updated successfully');

        res.redirect('/admin/chefs');

    } catch (error) {

        console.log(error);
        res.redirect('/admin/chefs');

    }

};

exports.deleteChef = async (req, res) => {

    try {

        await Chef.findByIdAndDelete(req.params.id);

        req.flash('success_msg', 'Chef deleted successfully');

        res.redirect('/admin/chefs');

    } catch (error) {

        console.log(error);
        res.redirect('/admin/chefs');

    }

};

exports.listUsers = async (req, res) => {

    try {

        const users = await User.find({ role: "user" });

        res.render("admin/users", {
            users,
            user: req.user
        });

    } catch (err) {

        console.log(err);
        res.redirect("/admin/dashboard");

    }

}

exports.deleteUser = async (req, res) => {

    try {

        await User.findByIdAndDelete(req.params.id);

        req.flash("success_msg", "User deleted");

        res.redirect("/admin/users");

    } catch (err) {

        console.log(err);
        res.redirect("/admin/users");

    }

}