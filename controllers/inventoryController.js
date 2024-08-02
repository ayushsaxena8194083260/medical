const Inventory = require('../models/inventory');
const Medicine = require('../models/medicine');

// Get inventory details
exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().populate('productId');
    res.json(inventory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update stock stock
exports.updateStock = async (req, res) => {
    const { productId } = req.params;
    const { stock } = req.body;
  
    if (!Number.isInteger(stock)) {
      return res.status(400).json({ msg: 'Quantity must be an integer' });
    }
  
    try {
      // Find the inventory item
      let inventory = await Inventory.findOne({ productId });
  
      if (!inventory) {
        return res.status(404).json({ msg: 'Product not found in inventory' });
      }
  
      // Update inventory stock
      inventory.stock = stock;
      await inventory.save();
  
      // Update product stock
      let medicine = await Medicine.findById(productId);
  
      if (!medicine) {
        return res.status(404).json({ msg: 'Product not found' });
      }
  
      medicine.stock = stock;
      await medicine.save();
  
      res.json({ inventory, medicine });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };

// Get low stock alerts
exports.getLowStock = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({ stock: { $lte: 'threshold' } }).populate('productId');
    res.json(lowStockItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
