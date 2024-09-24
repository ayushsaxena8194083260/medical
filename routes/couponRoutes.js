const express = require('express');
const { createCoupon, applyCoupon, viewCoupons, getCouponById, updateCoupon, couponStatus } = require('../controllers/couponController');
const router = express.Router();

// Route to create a new coupon
router.post('/create', createCoupon);
router.post('/applyCoupon', applyCoupon);
router.get('/viewCoupon', viewCoupons);
router.get('/:id', getCouponById);
router.put('/updateCoupons/:id', updateCoupon);
router.put('/changeStatus/:id', couponStatus);

module.exports = router;
