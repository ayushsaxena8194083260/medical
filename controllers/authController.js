// controllers/authController.js
const User = require('../models/user');
const Address = require('../models/address'); // Import the Address model

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password, role, shopName, addresses } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role,
      shopName,
    });

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user
    await user.save();

    // Add addresses if provided
    if (addresses && addresses.length > 0) {
      const addressPromises = addresses.map(async (address) => {
        const newAddress = new Address({
          ...address,
          user: user._id  // Link address to user
        });
        const savedAddress = await newAddress.save();
        return savedAddress._id; // Return the ObjectId of the saved address
      });

      const addressIds = await Promise.all(addressPromises);
      user.addresses = addressIds; // Store the array of ObjectIds in user
      await user.save();
    }

    // Generate a JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '6h' }, (err, token) => {
      if (err) throw err;
      // Return user details and token
      res.json({ user, token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Prepare the payload with user details
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    // Generate a JWT token with 6 hours expiry
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '6h' }, (err, token) => {
      if (err) throw err;

      // Send token along with user info
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


