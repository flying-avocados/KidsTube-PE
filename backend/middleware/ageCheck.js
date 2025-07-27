const jwt = require('jsonwebtoken');
const User = require('../models/Parent');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user not found.' });
    }

    // Preserve userType from JWT token
    req.user = {
      ...user.toObject(),
      userType: decoded.userType || 'parent' // Default to parent if not specified
    };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    
    next();
  };
};

module.exports = { auth, requireRole }; 