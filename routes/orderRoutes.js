const router = require('express').Router();
const Order = require('../models/Order');
const User = require('../models/User');

router.post('/', async (req, res) => {
  const { owner, cart, phone, address } = req.body;
  try {
    const user = await User.findById(owner);
    const order = await Order.create({
      owner: user._id,
      products: cart,
      phone,
      address,
    });
    order.count = cart.count;
    order.total = cart.total;
    await order.save();
    user.cart = { total: 0, count: 0 };
    user.orders.push(order);
    user.markModified('orders');
    await user.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json(e.message);
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('owner', ['email', 'name']);
    res.status(200).json(orders);
  } catch (e) {
    res.status(400).json(e.message);
  }
});

module.exports = router;
