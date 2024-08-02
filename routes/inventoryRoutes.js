const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { getInventory, updateStock, getLowStock } = require('../controllers/inventoryController');


router.get('/', authMiddleware, getInventory);
router.put('/:productId', authMiddleware, roleMiddleware(['admin']), updateStock);
router.get('/low-stock', authMiddleware, getLowStock);

module.exports = router;
