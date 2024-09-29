const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { makePayment } = require('../controllers/payment');


router.post('/makePayment', authMiddleware, makePayment);


module.exports = router;
