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
  addAddress,
  deleteAddress,
  updateAddress,
} = require('../controllers/userController');
const { sendOtp, verifyOtpAndChangePassword, forgotPassword } = require('../controllers/authController');

router.get('/logout', authMiddleware, logout);
router.get('/', authMiddleware, roleMiddleware(['admin']), getAllUsers);
router.get('/:id', authMiddleware, roleMiddleware(['admin', 'user']), getUserDetails);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'user']), updateUserDetails);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteUser);
router.put('/change-password', authMiddleware, changePassword);
router.post('/add-address', authMiddleware, addAddress);
router.post('/update-address', authMiddleware, updateAddress);
router.delete('/delete-address/:userId/:addressId', authMiddleware, deleteAddress);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', verifyOtpAndChangePassword)
module.exports = router;

