const router = require("express").Router();
const upload = require("../middlewares/upload");

const {
    chefList,
    chefForm,
    createChef
} = require("../controllers/chef.controller");

// chefs 
router.get("/", chefList);
router.get("/add", chefForm);
router.post("/add", upload.single("image"), createChef);


module.exports = router;