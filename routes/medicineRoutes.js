// routes/medicineRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  incrementStock,
} = require('../controllers/medicineController');

router.get('/', authMiddleware, getMedicines);
router.get('/:id', authMiddleware, getMedicineById);
router.post('/', authMiddleware, roleMiddleware(['admin']), createMedicine);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateMedicine);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteMedicine);
router.put('/increment-stock/:productId', authMiddleware, roleMiddleware(['admin']), incrementStock);

module.exports = router;
