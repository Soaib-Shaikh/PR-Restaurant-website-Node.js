const Restaurant = require('../models/restaurantSchema');
const Menu = require('../models/menuSchema');
const User = require('../models/userSchema')

exports.homePage = async (req, res) => {
    try {
        const restaurants = await Restaurant.find({ isActive: true }).sort({ createdAt: -1 })
            .populate('createdBy', 'username')

        const menus = await Menu.find().populate('restaurant');
        res.render('restaurants/homepage', { restaurants, menus, user: req.user });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Something went wrong');
        res.redirect('/');
    }
};

exports.addRestaurantPage = (req, res) => {
    return res.render('restaurants/addRestaurant', { user: req.user })
}

exports.createRestaurant = async (req, res) => {
    try {
        const {
            name,
            address,
            cuisine,
            phone,
            email,
            description,
            openingHours,
            rating,
            isActive
        } = req.body;

        const image = req.file ? '/uploads/restaurant/' + req.file.filename : '/uploads/restaurant-default.png';

        const newRestaurant = new Restaurant({
            name,
            address,
            cuisine,
            phone,
            email,
            description,
            openingHours,
            rating,
            isActive: isActive ? true : false,
            image,
            createdBy: req.user._id
        });

        await newRestaurant.save();
        req.flash('success_msg', 'Restaurant added successfully!');
        res.redirect('/restaurant');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Something went wrong!');
        res.redirect(req.get('Referer') || '/restaurant');
    }
};


exports.getSingleRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            req.flash('error_msg', 'Restaurant not found');
            return res.redirect('/restaurant');
        }

        const menus = await Menu.find({ restaurant: id });

        return res.render('restaurants/detail', {
            restaurant,
            menus,
            user: req.user
        })
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Something went wrong');
        res.redirect('/restaurant');
    }
}

// Edit
exports.editRestaurantPage = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            req.flash('error_msg', 'Restaurant not found');
            return res.redirect('/restaurant');
        }

        return res.render('restaurants/editRestaurant', { restaurant, user: req.user })
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Something went wrong');
        res.redirect('/restaurant');
    }
}

exports.updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            req.flash('error_msg', 'Restaurant not found');
            return res.redirect('/restaurant');
        }

        // Only owner can update
        if (restaurant.createdBy.toString() !== req.user._id.toString()) {
            req.flash('error_msg', 'You are not authorized to edit this restaurant');
            return res.redirect('/restaurant');
        }

        // Prepare updated data
        const { name, address, cuisine, phone, email, description, openingHours, rating, isActive } = req.body;
        const updateData = {
            name,
            address,
            cuisine,
            phone,
            email,
            description,
            openingHours,
            rating,
            isActive: isActive === 'true'
        };

        // Update image if uploaded
        if (req.file) {
            // Purani image delete karo agar default image nahi hai
            if (restaurant.image && restaurant.image !== "/uploads/restaurant-default.png") {
                const oldPath = require('path').join(__dirname, '..', 'public', restaurant.image);
                const fs = require('fs');
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            // Nayi image assign karo
            updateData.image = '/uploads/restaurant/' + req.file.filename;
        }

        Object.assign(restaurant, updateData);
        await restaurant.save();

        req.flash('success_msg', 'Restaurant updated successfully!');
        res.redirect('/restaurant'); // <-- Corrected
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Something went wrong!');
        res.redirect(req.get('Referer') || '/restaurant');
    }
};


// Delete
exports.deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            req.flash('error-msg', 'Restaurant not found.')
            return res.redirect(req.get('Referrer') || '/')
        }

        if (restaurant.createdBy.toString() !== req.user._id.toString()) {
            req.flash('error_msg', 'You are not authorized to delete this restaurant');
            return res.redirect('/restaurant');
        }

        if (restaurant.image && restaurant.image !== "/uploads/restaurant-default.png") {
            const fs = require('fs');
            const path = require('path');
            const imgPath = path.join(__dirname, '..', 'public', restaurant.image);
            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
            }
        }


        await restaurant.deleteOne(); // safe delete
        req.flash('success_msg', 'Restaurant deleted successfully!');
        return res.redirect('/restaurant');

    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Something went wrong!');
        res.redirect('/restaurant');
    }
}

exports.restaurantMenu = async (req, res) => {
    try {
        const restaurantId = req.params.id;
        const restaurant = await Restaurant.findById(restaurantId).lean();
        if (!restaurant) return res.status(404).send('Restaurant not found');

        const menus = await Menu.find({ restaurant: restaurantId }).lean();

        return res.render('restaurants/menu', { restaurant, menus, user: req.user });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Something went wrong!');
        res.redirect('/restaurant');
    }
}