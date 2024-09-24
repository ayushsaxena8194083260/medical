const coupon = require('../models/coupon');
const Coupon = require('../models/coupon');
// Create a new coupon
exports.createCoupon = async (req, res) => {
    const { name, discountPercentage, expireDate } = req.body;

    try {
        let existingCoupon = await coupon.findOne({ name });
        if (existingCoupon) {
            return res.status(400).json({ msg: 'Coupon with this name already exists' });
        }

        const newCoupon = new Coupon({
            name,
            discountPercentage,
            expireDate,
        });

        await newCoupon.save();
        res.json({ msg: 'Coupon created successfully', coupon: newCoupon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error', error });
    }
};

exports.applyCoupon = async (req, res) => {
    const { couponName, totalPrice } = req.body;

    try {
        const coupon = await Coupon.findOne({ name: couponName });

        if (!coupon) {
            return res.status(404).json({ msg: 'Coupon not found' });
        }

        const currentDate = new Date();
        if (currentDate > coupon.expireDate) {
            return res.status(400).json({ msg: 'Coupon has expired' });
        }

        const discount = (coupon.discountPercentage / 100) * totalPrice;
        const discountedPrice = totalPrice - discount;

        return res.json({
            msg: 'Coupon applied successfully',
            originalPrice: totalPrice,
            discountedPrice,
            discountPercentage: coupon.discountPercentage,
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.viewCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({ expireDate: { $gte: new Date() } });

        if (coupons.length === 0) {
            return res.status(404).json({ msg: 'No coupons available' });
        }

        res.json({
            msg: 'Available coupons retrieved successfully',
            coupons,
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.getCouponById = async (req, res) => {
    try {
      const couponId = req.params.id;
  
      // Find coupon by ID
      const coupon = await Coupon.findById(couponId);
  
      if (!coupon) {
        return res.status(404).json({ msg: 'Coupon not found' });
      }
  
      // Respond with the coupon details
      res.status(200).json(coupon);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server error' });
    }
  };

  exports.updateCoupon = async (req, res) => {
    try {
      const couponId = req.params.id;
      const { name, discountPercentage, expiryDate, isActive } = req.body;
  
      let coupon = await Coupon.findById(couponId);
  
      if (!coupon) {
        return res.status(404).json({ msg: 'Coupon not found' });
      }
  
      coupon.name = name || coupon.name;
      coupon.discountPercentage = discountPercentage || coupon.discountPercentage;
      coupon.expiryDate = expiryDate || coupon.expiryDate;
      coupon.isActive = typeof isActive === 'boolean' ? isActive : coupon.isActive;
  
      await coupon.save();
  
      res.status(200).json({ msg: 'Coupon updated successfully', coupon });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server error' });
    }
  };

  exports.couponStatus = async (req, res) => {
    try {
      const couponId = req.params.id;
      const { isActive } = req.body; 
      let coupon = await Coupon.findById(couponId);
  
      if (!coupon) {
        return res.status(404).json({ msg: 'Coupon not found' });
      }
  
      coupon.isActive = isActive;
  
      await coupon.save();
  
      const action = isActive ? 'activated' : 'deactivated';
      res.status(200).json({ msg: `Coupon ${action} successfully`, coupon });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server error' });
    }
  };