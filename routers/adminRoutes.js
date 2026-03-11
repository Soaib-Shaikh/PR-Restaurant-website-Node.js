const { Router } = require('express');
const adminAuth = require('../middlewares/adminAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = Router();
const adminController = require('../controllers/admin.controller');

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../public/uploads/admin');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Dashboard & Reservations
router.get('/dashboard', adminAuth, adminController.adminDashboard);
router.get('/reservations', adminAuth, adminController.manageReservations);

// Restaurants
router.get('/restaurants', adminAuth, adminController.listRestaurants);
router.get('/restaurants/add', adminAuth, adminController.addRestaurantPage);
router.post('/restaurants/add', adminAuth, upload.single('image'), adminController.createRestaurant);
router.get('/restaurants/edit/:id', adminAuth, adminController.editRestaurantPage);
router.post('/restaurants/edit/:id', adminAuth, upload.single('image'), adminController.updateRestaurant);
router.post('/restaurants/delete/:id', adminAuth, adminController.deleteRestaurant);

// Menus
router.get('/menus', adminAuth, adminController.listMenus);
router.get('/menus/add', adminAuth, adminController.addMenuPage);
router.post('/menus/add', adminAuth, upload.single('image'), adminController.createMenu);
router.get('/menus/edit/:id', adminAuth, adminController.editMenuPage);
router.post('/menus/edit/:id', adminAuth, upload.single('image'), adminController.updateMenu);
router.post('/menus/delete/:id', adminAuth, adminController.deleteMenu);

//// RESERVATION CRUD
router.get('/reservations', adminAuth, adminController.manageReservations);
router.get('/reservations/edit/:id', adminAuth, adminController.editReservationPage);
router.post('/reservations/edit/:id', adminAuth, adminController.updateReservation);
router.post('/reservations/delete/:id', adminAuth, adminController.deleteReservation);

router.post('/reservations/edit/:id', adminAuth, adminController.updateReservationStatus);

router.get('/chefs', adminAuth, adminController.listChefs);
router.get('/chefs/add', adminAuth, adminController.addChefPage);
router.post('/chefs/add', adminAuth, upload.single('image'), adminController.createChef);
router.get('/chefs/edit/:id', adminController.editChefPage);
router.post('/chefs/edit/:id', upload.single('image'), adminController.updateChef);
router.post('/chefs/delete/:id', adminController.deleteChef);

router.get('/users', adminAuth, adminController.listUsers);
router.post('/users/delete/:id', adminAuth, adminController.deleteUser);

module.exports = router;
