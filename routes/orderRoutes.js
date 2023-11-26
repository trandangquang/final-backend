const router = require('express').Router();
const Order = require('../models/Order');
const User = require('../models/User');
const moment = require('moment');

router.post('/', async (req, res) => {
  const io = req.app.get('socketio');

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
    const notification = {
      status: 'unread',
      message: `New order from ${user.name}`,
      time: new Date(),
    };
    io.sockets.emit('new-order', notification);
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

router.patch('/:id/mark-shipped', async (req, res) => {
  const io = req.app.get('socketio');
  const { ownerId } = req.body;
  const { id } = req.params;
  try {
    const user = await User.findById(ownerId);
    await Order.findByIdAndUpdate(id, { status: 'shipped' });
    const orders = await Order.find().populate('owner', ['email', 'name']);

    const notification = {
      status: 'unread',
      message: `Order ${id} shipped with success`,
      time: new Date(),
    };
    io.sockets.emit('notification', notification, ownerId);

    user.notifications.push(notification);

    await user.save();
    res.status(200).json(orders);
  } catch (e) {
    res.status(400).json(e.message);
  }
});

router.get('/stats', async (req, res) => {
  const previousMonth = moment()
    .month(moment().month() - 1)
    .set('date', 1)
    .format('YYYY-MM-DD HH:mm:ss');
  try {
    const orders = await Order.aggregate([
      {
        $match: { createdAt: { $gte: new Date(previousMonth) } },
      },
      {
        $project: {
          month: { $month: '$createdAt' },
        },
      },
      {
        $group: {
          _id: '$month',
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(orders);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

router.get('/income/stats', async (req, res) => {
  const previousMonth = moment()
    .month(moment().month() - 1)
    .set('date', 1)
    .format('YYYY-MM-DD HH:mm:ss');
  try {
    const income = await Order.aggregate([
      {
        $match: { createdAt: { $gte: new Date(previousMonth) } },
      },
      {
        $project: {
          month: { $month: '$createdAt' },
          sales: '$total',
        },
      },
      {
        $group: {
          _id: '$month',
          total: { $sum: '$sales' },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

router.get('/week-sales/stats', async (req, res) => {
  const last7Days = moment()
    .day(moment().day() - 7)
    .format('YYYY-MM-DD HH:mm:ss');
  try {
    const income = await Order.aggregate([
      {
        $match: { createdAt: { $gte: new Date(last7Days) } },
      },
      {
        $project: {
          day: { $dayOfWeek: '$createdAt' },
          sales: '$total',
        },
      },
      {
        $group: {
          _id: '$day',
          total: { $sum: '$sales' },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

module.exports = router;
