// controllers/userController.js
const Address = require("../models/address");
const User = require("../models/user");
const { addToBlacklist } = require("../utils/tokenBlacklist");


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('addresses') // Populate the addresses field
      .select("-password");  // Exclude the password field

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.updateUserDetails = async (req, res) => {
  const { name, email, shopName } = req.body;
  const userFields = { name, email, shopName };

  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userFields },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await User.findByIdAndRemove(req.params.id);
    res.json({ msg: "User removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Compare the current password with the stored password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    // Directly set the new password from the frontend (assumed to be hashed)
    user.password = newPassword;

    await user.save();

    res.json({ msg: "Password changed successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.addAddress = async (req, res) => {
  const { userId,houseNo, street, city, state, postalCode } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const newAddress = new Address({
      houseNo,
      street,
      city,
      state,
      postalCode,
      user: userId,
    });

    const savedAddress = await newAddress.save();

    user.addresses.push(savedAddress._id);
    await user.save();

    res.json(savedAddress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateAddress = async (req, res) => {
  const { houseNo,addressId, street, city, state, postalCode } = req.body;

  try {
    let address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ msg: 'Address not found' });
    }

    address.street = street || address.street;
    address.houseNo = houseNo || address.houseNo;
    address.city = city || address.city;
    address.state = state || address.state;
    address.postalCode = postalCode || address.postalCode;

    const updatedAddress = await address.save();

    res.json(updatedAddress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteAddress = async (req, res) => {
  const { addressId, userId } = req.params;

  try {
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ msg: 'Address not found' });
    }

    await address.remove();

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { addresses: addressId } },
      { new: true }
    );

    res.json({ msg: 'Address removed', addresses: user.addresses });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.logout = (req, res) => {
  const token = req.header("token");
  addToBlacklist(token);
  res.json({ msg: "User logged out" });
};
