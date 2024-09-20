// models/User.js
const mongoose = require('mongoose');

// Define the User schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }], // Array of ObjectIds
  shopName: {
    type: String,
  },
});



module.exports = mongoose.model('User', UserSchema);
