const { Router } = require("express");
const adminAuth = require("../middlewares/adminAuth");
const { 
    homePage,
    createRestaurant, 
    restaurantMenu,
    addRestaurantPage, 
    getSingleRestaurant,
    editRestaurantPage,
    updateRestaurant,
    deleteRestaurant
} = require('../controllers/restaurant.controller');

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = Router();

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../public/uploads/restaurant');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// -------- Public routes (user can view) --------
router.get('/', homePage);
router.get('/:id', getSingleRestaurant);
router.get('/:id/menu', restaurantMenu)

// -------- Admin-only routes --------
router.get('/add', adminAuth, addRestaurantPage);
router.post('/add', adminAuth, upload.single('image'), createRestaurant);

router.get('/edit/:id', adminAuth, editRestaurantPage);
router.post('/edit/:id', adminAuth, upload.single('image'), updateRestaurant);

router.post('/delete/:id', adminAuth, deleteRestaurant);


module.exports = router;
