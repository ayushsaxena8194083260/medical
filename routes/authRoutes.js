// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/register', register);
router.post('/login', login);

// Example of a protected route that only admin can access
router.get('/admin', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  res.send('Admin content');
});

// Example of a protected route that both user and admin can access
router.get('/user', authMiddleware, roleMiddleware(['user', 'admin']), (req, res) => {
  res.send('User content');
});

module.exports = router;
