// controllers/medicineController.js
const inventory = require("../models/inventory");
const Medicine = require("../models/medicine");

exports.getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ msg: "Medicine not found" });
    }
    res.json(medicine);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.createMedicine = async (req, res) => {
  const { name, decription, manufacturer, expirationDate, price, stock } = req.body;
  const image = req.file ? req.file.path : '';
  try {
    const newMedicine = new Medicine({
      name, decription, manufacturer, expirationDate, price, stock, image
    });

    const medicine = await newMedicine.save();

    // Add to inventory
    const newInventory = new inventory({
      productId: medicine._id,
      stock,
      threshold: 10,
    });
    await newInventory.save();

    res.json({medicine,inventory: newInventory});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.updateMedicine = async (req, res) => {
  const { name, decription, manufacturer, expirationDate, price, stock } =
    req.body;
  const medicineFields = {
    name,
    decription,
    manufacturer,
    expirationDate,
    price,
    stock,
  };

  try {
    let medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ msg: "Medicine not found" });
    }

    medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { $set: medicineFields },
      { new: true }
    );
    res.json(medicine);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    let medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ msg: "Medicine not found" });
    }

    await Medicine.findByIdAndRemove(req.params.id);
    res.json({ msg: "Medicine removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Increment stock stock
exports.incrementStock = async (req, res) => {
  const { productId } = req.params;
  const { stock } = req.body;

  if (!Number.isInteger(stock)) {
    return res.status(400).json({ msg: 'Quantity must be an integer' });
  }

  try {
    // Find and increment the product stock
    let product = await Medicine.findByIdAndUpdate(
      productId,
      { $inc: { stock: stock } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ msg: 'Medicine not found' });
    }

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


