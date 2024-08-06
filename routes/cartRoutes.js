const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { removeFromCart, getCart, addToCart, updateCartQuantity } = require('../controllers/cartController');

router.post('/', authMiddleware, addToCart);
router.get('/', authMiddleware, getCart);
router.delete('/:medicalId', authMiddleware, removeFromCart);
router.put('/update-quantity', authMiddleware, updateCartQuantity);

module.exports = router;
