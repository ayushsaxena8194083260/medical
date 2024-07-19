// controllers/orderController.js
const Order = require('../models/orders');
const User = require('../models/user');
const mongoose = require('mongoose');

exports.createOrder = async (req, res) => {
    const { items, totalAmount } = req.body;
  
    // Validate ObjectId format
    for (let item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ msg: `Invalid product ID: ${item.product}` });
      }
    }
  
    try {
      const user = req.user.id;
      const newOrder = new Order({
        user,
        items,
        totalAmount,
      });
  
      const order = await newOrder.save();
      res.json(order);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').populate('items.product', 'name brand price');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email').populate('items.product', 'name brand price');
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  try {
    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    await Order.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Order removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
