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
  getAllUsers,
} = require('../controllers/userController');

router.get('/logout', authMiddleware, logout);
router.get('/', authMiddleware, roleMiddleware(['admin']), getAllUsers);
router.get('/:id', authMiddleware, roleMiddleware(['admin', 'user']), getUserDetails);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'user']), updateUserDetails);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteUser);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
