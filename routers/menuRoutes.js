const { Router } = require("express");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = Router();
const { 
    addMenuPage, 
    addMenu, 
    addMenuPageForRestaurant, 
    getMenusByCategory,
    editMenuPage,
    updateMenu,
    deleteMenu
} = require('../controllers/menu.controller');
const adminAuth = require("../middlewares/adminAuth");

// Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../public/uploads/menu');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// -------- Public routes --------
router.get('/category/:category', getMenusByCategory);

// -------- Admin-only routes --------
router.get('/addMenu', adminAuth, addMenuPage);
router.post('/addMenu', adminAuth, upload.single('image'), addMenu);

router.get('/add/:restaurantId', adminAuth, addMenuPageForRestaurant);
router.post('/add/:restaurantId', adminAuth, upload.single('image'), addMenu);

router.get('/edit/:id', adminAuth, editMenuPage);
router.post('/edit/:id', adminAuth, upload.single('image'), updateMenu);

router.post('/delete/:id', adminAuth, deleteMenu);

module.exports = router;
