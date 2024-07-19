// controllers/medicineController.js
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
  const { name, decription, manufacturer, expirationDate, price, stock  } = req.body;
  const image = req.file ? req.file.path : '';
  try {
    const newMedicine = new Medicine({
      name, decription, manufacturer, expirationDate, price, stock,image
    });

    const medicine = await newMedicine.save();
    res.json(medicine);
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

