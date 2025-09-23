const Menu = require('../models/menuSchema');
const Restaurant = require('../models/restaurantSchema');
const path = require('path');
const fs = require('fs');

// GET: show add-menu page (all restaurants dropdown)
exports.addMenuPage = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isActive: true }).sort({ name: 1 }).lean();
    return res.render('menus/addMenu', { restaurants, user: req.user });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load add menu page');
    return res.redirect('/restaurant');
  }
};

// GET: show add-menu page for specific restaurant (restaurantId in URL)
exports.addMenuPageForRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId).lean();
    if (!restaurant) {
      req.flash('error_msg', 'Restaurant not found');
      return res.redirect('/restaurant');
    }
    // pass single restaurant (no dropdown)
    return res.render('menus/addMenu', { restaurant, user: req.user });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load add menu page');
    return res.redirect(req.get('Referrer') || '/');
  }
};

exports.addMenu = async (req, res) => {
  try {
    // Prefer URL param, fallback to form field
    const restaurantId = req.params.restaurantId || req.body.restaurant;
    if (!restaurantId) {
      req.flash('error_msg', 'Restaurant not specified');
      return res.redirect(req.get('Referrer') || '/');
    }

    // Fetch restaurant to check ownership
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      req.flash('error_msg', 'Restaurant not found');
      return res.redirect('/restaurant');
    }

    // Only owner can add menu
    if (restaurant.createdBy.toString() !== req.user._id.toString()) {
      req.flash('error_msg', 'You are not authorized to add menu for this restaurant');
      return res.redirect(`/restaurant/${restaurantId}`);
    }

    const { name, description, price, category } = req.body;
    const imagePath = req.file ? "/uploads/menu/" + req.file.filename : "/uploads/menu-default.png";

    const menu = new Menu({
      restaurant: restaurantId,
      name,
      description,
      price,
      category,
      image: imagePath,
      createdBy: req.user._id // Required field
    });

    await menu.save();
    req.flash('success_msg', 'Menu item added successfully!');
    return res.redirect(`/restaurant/${restaurantId}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error adding menu');
    return res.redirect(req.get('Referrer') || '/');
  }
};

exports.getMenusByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Fetch menus for the category and populate restaurant info
    const menus = await Menu.find({ category })
      .populate('restaurant', 'name image createdBy') // owner check ke liye createdBy add kiya
      .lean();

    // Ensure menu.image contains proper path (no need to split now, DB path already correct hoga)
    menus.forEach(menu => {
      if (!menu.image) {
        menu.image = "/uploads/menu-default.png";
      }
    });

    // Render the category menu page
    return res.render('menus/categoryMenus', {
      menus,
      category,
      user: req.user || null
    });
  } catch (error) {
    console.error('Error fetching menus by category:', error);
    req.flash('error_msg', 'Something went wrong while fetching menus');
    return res.redirect(req.get('Referrer') || '/');
  }
};


// Edit
exports.editMenuPage = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findById(id);

    if (!menu) {
      req.flash('error_msg', 'Menu not found.')
      return res.redirect(req.get('Referrer') || '/');
    }

    return res.render('menus/editMenu', { menu, user: req.user })
  } catch (error) {
    console.log(error);
    req.flash('error_msg', 'Something went wrong')
    return res.redirect(req.get('Referrer') || '/');
  }
}

exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category } = req.body;

    const menu = await Menu.findById(id);
    if (!menu) {
      req.flash('error_msg', 'Menu not found');
      return res.redirect(req.get('Referrer') || '/restaurant');
    }

    const updateMenu = {
      name,
      description,
      price,
      category
    };

    // Agar nayi image upload hui hai
    if (req.file) {
      // Purani image delete karo (agar default image nahi hai)
      if (menu.image && menu.image !== "/uploads/menu-default.png") {
        const oldPath = require('path').join(__dirname, '..', 'public', menu.image);
        const fs = require('fs');
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      // Nayi image ka path save karo
      updateMenu.image = "/uploads/menu/" + req.file.filename;
    }

    await Menu.findByIdAndUpdate(id, updateMenu, { new: true });

    req.flash('success_msg', 'Menu updated successfully');
    return res.redirect('/restaurant');

  } catch (error) {
    console.log(error);
    req.flash('error_msg', 'Something went wrong');
    return res.redirect(req.get('Referrer') || '/restaurant');
  }
};


// Delete
exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findById(id);

    if (!menu) {
      req.flash('error_msg', 'Menu not found.')
      return res.redirect(req.get('Referrer') || '/');
    }

    if (menu.image && menu.image !== "/uploads/menu-default.png") {
      const fs = require('fs');
      const path = require('path');
      const imgPath = path.join(__dirname, '..', 'public', menu.image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }


    await Menu.findByIdAndDelete(id);

    req.flash('success_msg', 'Menu deleted successfully');
    return res.redirect('/restaurant');
  } catch (error) {
    console.log(error);
    req.flash('error_msg', 'Something went wrong')
    return res.redirect(req.get('Referrer') || '/');
  }
}
