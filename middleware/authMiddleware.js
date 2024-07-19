// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { isBlacklisted } = require('../utils/tokenBlacklist');

module.exports = function (req, res, next) {
  const token = req.header('token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  if (isBlacklisted(token)) {
    return res.status(401).json({ msg: 'Token has been logged out' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
