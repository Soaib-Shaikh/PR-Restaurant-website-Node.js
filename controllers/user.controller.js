const User = require('../models/userSchema');

// Profile page
exports.profilePage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    return res.render('user/profile', { user });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Something went wrong');
    return res.redirect('/');
  }
};

// Edit profile page
exports.editProfilePage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/user/profile');
    }
    return res.render('user/editProfile', { user });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Something went wrong');
    return res.redirect('/user/profile');
  }
};

// Update profile
exports.editProfile = async (req, res) => {
  try {
    const { fullName, username, email, phone, address, bio } = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      fullName,
      username,
      email,
      phone,
      address,
      bio
    });

    req.flash('success_msg', 'Profile updated successfully');
    res.redirect('/user/profile');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Something went wrong');
    res.redirect('/user/edit');
  }
};
