const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  threshold: {
    type: Number,
    default: 10, // This value can be adjusted based on the requirements
  }
});

module.exports = mongoose.model('Inventory', InventorySchema);
