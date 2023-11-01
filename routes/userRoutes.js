const router = require('express').Router();
const User = require('../models/User');
const Order = require('../models/Order');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.create({ name, email, password });
    res.status(200).json(user);
  } catch (e) {
    if (e.code === 11000) return res.status(400).send('Email is already exits');
    res.status(400).send(e.message);
  }
});

// router.post('/register-with-google', async (req, res) => {
//   const {name, email} = req.body
//   try {
//     const user = await User.create({ name, email });
//     res.status(200).json(user);
//   } catch (e) {
//     if (e.code === 11000) return res.status(400).send('Email is already exits');
//     res.status(400).send(e.message);
//   }
// })

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    res.status(200).json(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// router.post('/login-with-google', async (req, res) => {
//   const { email } = req.body;
//   try {
//     const user = await User.findOne({email});
//     console.log('user',user)
//     res.status(200).json(user);
//   } catch (e) {
//     res.status(400).send(e.message);
//   }
// });

router.get('/', async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false }).populate('orders');
    res.status(200).json(users);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.status(200).json({ user });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { name, email, address, phone } = req.body;
    const user = await User.findByIdAndUpdate(id, {
      name,
      email,
      address,
      phone,
    });
    const users = await User.find();
    res.status(200).json(users);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    const users = await User.find();
    res.status(200).json(users);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.get('/:id/orders', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).populate('orders');
    res.status(200).json(user.orders);
  } catch (e) {
    res.status(400).send(e.message);
  }
});



module.exports = router;
