// models/Address.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Reference to User
});

module.exports = mongoose.model('Address', addressSchema);
