// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  addOrder,
  getOrderByOrderId,
} = require('../controllers/orderController');

router.post('/', authMiddleware, createOrder);
router.post('/add', authMiddleware, addOrder);
router.get('/', authMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrderById);
router.put('/:id/status', authMiddleware, roleMiddleware(['admin']), updateOrderStatus);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteOrder);
// router.get('/orderDetails/:id', getOrderByOrderId);

module.exports = router;
