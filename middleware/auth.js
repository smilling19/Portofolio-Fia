const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretportfoliojwtkey123!';

module.exports = (req, res, next) => {
  let token = req.headers['authorization'] || req.headers['x-access-token'];
  
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7).trim();
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};
