const Order = require('../models/orderSchema');
const Menu = require('../models/menuSchema');

exports.newOrderPage = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.menuId).populate('restaurant', 'name').lean();
    if (!menu) {
      req.flash('error_msg', 'Menu not found');
      return res.redirect('back');
    }

    return res.render('orders/newOrder', { menu, user: req.user });
  } catch (error) {
    console.log(error);
    req.flash('error_msg', 'Something went wrong');
    return res.redirect('back');
  }
};

exports.createOrder = async (req, res) => {
  try {
    let { menuId, quantity, address, items } = req.body; // items for cart
    let orderItems = [];
    let total = 0;
    let restaurantId;

    if (items && items.length > 0) {
      // Multiple items (cart)
      for (let i of items) {
        const menuItem = await Menu.findById(i.menuId);
        if (menuItem) {
          total += menuItem.price * i.quantity;
          orderItems.push({ menu: menuItem._id, quantity: i.quantity });
          restaurantId = menuItem.restaurant;
        }
      }
    } else if (menuId) {
      // Single menu item (Order Now)
      const menuItem = await Menu.findById(menuId);
      if (!menuItem) throw new Error('Menu not found');
      total = menuItem.price * quantity;
      orderItems.push({ menu: menuItem._id, quantity });
      restaurantId = menuItem.restaurant;
    } else {
      throw new Error('No items to order');
    }

    const order = new Order({
      user: req.user._id,
      restaurant: restaurantId,
      items: orderItems,
      total,
      address
    });

    await order.save();
    return res.redirect(`/order/${order._id}`);
  } catch (error) {
    console.log(error);
    req.flash('error_msg', 'Failed to place order.');
    return res.redirect('back');
  }
};

exports.orderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user')
      .populate('items.menu')
      .lean();

    if (!order) {
      req.flash('error_msg', 'Order not found.');
      return res.redirect('back');
    }

    return res.render('orders/details', { order, user: req.user });
  } catch (error) {
    console.log(error);
    req.flash('error_msg', 'Something went wrong');
    return res.redirect('back');
  }
};
