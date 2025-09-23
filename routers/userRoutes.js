const express = require("express");
const router = express.Router();
const passport = require('../middlewares/passport');
const upload = require("../middlewares/upload");
const User = require("../models/userSchema");
const { editProfilePage, editProfile, profilePage } = require("../controllers/user.controller");
const fs = require("fs");
const path = require("path");

// Protect all routes
router.use(passport.userAuth);

// Profile page
router.get('/profile', profilePage);

// Upload profile image
router.post("/upload", upload.single("profileImage"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!req.file) {
      req.flash("error_msg", "Please upload an image file.");
      return res.redirect("/user/profile");
    }

    // Delete old image if not default
    if (user.profileImage && user.profileImage !== "/uploads/default-avatar.png") {
      const oldPath = path.join(__dirname, "../public", user.profileImage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Save new image path
    user.profileImage = "/uploads/" + req.file.filename;
    await user.save();

    req.flash("success_msg", "Profile image updated successfully.");
    res.redirect("/user/profile");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Something went wrong.");
    res.redirect("/user/profile");
  }
});

// Remove profile image
router.post('/removeProfileImage', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.profileImage && user.profileImage !== "/uploads/default-avatar.png") {
      const oldPath = path.join(__dirname, "../public", user.profileImage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      user.profileImage = "/uploads/default-avatar.png";
      await user.save();
    }

    req.flash("success_msg", "Profile image removed.");
    res.redirect("/user/profile");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Something went wrong.");
    res.redirect("/user/profile");
  }
});

// Delete user profile
router.get("/delete", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.profileImage && user.profileImage !== "/uploads/default-avatar.png") {
      const filePath = path.join(__dirname, "../public", user.profileImage);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await User.findByIdAndDelete(req.user.id);

    req.logout(() => {
      req.flash("success_msg", "Profile deleted successfully.");
      res.redirect("/login");
    });
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Something went wrong.");
    res.redirect("/user/profile");
  }
});

// Edit profile routes
router.get("/edit", editProfilePage);
router.post("/edit", editProfile);

module.exports = router;
