// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getUserDetails,
  updateUserDetails,
  deleteUser,
  logout,
  changePassword,
} = require('../controllers/userController');

router.get('/logout', authMiddleware, logout);
router.get('/user/:id', authMiddleware, roleMiddleware(['admin', 'user']), getUserDetails);
router.put('/user/:id', authMiddleware, roleMiddleware(['admin', 'user']), updateUserDetails);
router.delete('/user/:id', authMiddleware, roleMiddleware(['admin']), deleteUser);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
