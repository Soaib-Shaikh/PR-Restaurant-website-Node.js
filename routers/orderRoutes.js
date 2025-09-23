const { Router } = require("express");
const router = Router();
const { newOrderPage, createOrder, orderDetails } = require('../controllers/order.controller');

// Show order form for a single menu item
router.get('/new/:menuId', newOrderPage);

// Create order (single item or multiple items)
router.post('/', createOrder);

// Order details page
router.get('/:id', orderDetails);

module.exports = router;
