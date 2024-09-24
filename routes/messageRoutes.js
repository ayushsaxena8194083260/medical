// routes/message.js
const express = require('express');
const router = express.Router();
const { getInTouch } = require('../controllers/messageController');

router.post('/contact', getInTouch);

module.exports = router;
