// controllers/orderController.js
const Cart = require('../models/cart');
const Medicine = require('../models/medicine');
const Order = require('../models/orders');
const User = require('../models/user');
const Address = require('../models/address'); // Assuming you have an Address model

const mongoose = require('mongoose');

// controllers/orderController.js

exports.addOrder = async (req, res) => {
  const { userId, items, totalAmount, addressId } = req.body;

  try {
    // Validate the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Validate address existence
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ msg: 'Address not found' });
    }

    // Validate medicines and calculate total amount
    const orderMedicines = [];
    let calculatedTotalAmount = 0;

    for (const item of items) {
      const medicine = await Medicine.findById(item.product); // Fetch medicine details using _id
      if (!medicine) {
        return res.status(404).json({ msg: `Medicine with ID ${item.product} not found` });
      }

      // Calculate total amount
      calculatedTotalAmount += medicine.price * item.quantity;

      // Add medicine details to order
      orderMedicines.push({
        product: medicine._id,
        name: medicine.name,
        manufacturer: medicine.manufacturer,
        quantity: item.quantity,
        price: medicine.price,
      });
    }

    // Check if totalAmount matches the calculated total
    if (totalAmount !== calculatedTotalAmount) {
      return res.status(400).json({ msg: 'Total amount mismatch' });
    }

    // Create new order
    const newOrder = new Order({
      user: userId,
      address: addressId, // Ensure this is correctly referenced
      products: orderMedicines,
      totalAmount: totalAmount,
      status: 'pending',
      items:items // Use a valid enum value
    });

    // Save the order
    await newOrder.save();

    // Clear the user's cart after placing the order
    await Cart.findOneAndUpdate({ user: userId }, { items: [], totalAmount: 0 });

    // Return order details
    res.status(201).json({ msg: 'Order placed successfully', order: newOrder });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


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
    clearCart(userId);
    res.status(200).json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const clearCart = async (userId) => {
  try {
    await Cart.deleteMany({ user: userId });
    console.log('Cart cleared successfully');
  } catch (error) {
    console.error('Error clearing cart:', error);
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

exports.getOrderByOrderId = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Find the order by ID and populate user, address, and medicine details
    const order = await Order.findById(orderId)
      .populate({
        path: 'user',
        select: 'name email shopName', // Fetch user's name and email
      })
      .populate({
        path: 'address',
        select: 'houseNo street city state postalCode phone', // Fetch address details
      })
      .populate({
        path: 'items.product',
        select: 'name manufacturer price image', // Fetch product details for each item
      });

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email ').populate('items.product', 'name manufacturer price image')
    .populate({
      path: 'address',
      select: 'houseNo street city state postalCode phone', // Fetch address details
    });;
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
