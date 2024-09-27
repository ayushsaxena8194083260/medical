// controllers/orderController.js
const Medicine = require('../models/medicine');
const Order = require('../models/orders');
const User = require('../models/user');
const mongoose = require('mongoose');


exports.createOrder = async (req, res) => {
  const { userId, items } = req.body;

  if (!userId) {
    return res.status(400).json({ msg: 'User ID is required' });
  }

  let totalAmount = 0;

  try {
    // Validate the items and update the medicine quantities
    for (let i = 0; i < items.length; i++) {
      const medicineId = items[i].product;
      let quantity = parseInt(items[i].quantity, 10);

      if (isNaN(quantity)) {
        return res.status(400).json({ msg: `Invalid quantity for medicine: ${medicineId}` });
      }

      const medicine = await Medicine.findById(medicineId);

      if (!medicine) {
        return res.status(404).json({ msg: `Medicine not found: ${medicineId}` });
      }

      if (medicine.quantity < quantity) {
        return res.status(400).json({ msg: `Not enough stock for medicine: ${medicine.name}` });
      }

      // Calculate total amount
      totalAmount += medicine.price * quantity;

      // Decrement medicine quantity
      medicine.stock -= quantity;
      await medicine.save();
    }

    // Create the order
    const order = new Order({
      user: userId,
      items,
      totalAmount,
      status: 'pending', // Ensure this is a valid enum value
      orderDate: new Date(),
    });

    await order.save();

    res.status(201).json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.getOrders = async (req, res) => {
  try {
    // Find all orders and populate user and product details
    const orders = await Order.find()
      .populate('user', 'name email address phone')  // Populate user details
      .populate({
        path: 'items.product',
        select: 'name brand price description category',  // Populate product details with additional fields
      });

    // Respond with the populated orders
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
