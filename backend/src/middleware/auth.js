const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const User = require('../models/User');

async function auth(req, res, next) {
  try {
    if (!process.env.JWT_SECRET) {
      return next(new AppError('Server misconfigured: JWT_SECRET missing', 500));
    }

    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return next(new AppError('Missing Authorization Bearer token', 401));
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.id).select('-password');
    if (!user) {
      return next(new AppError('User not found', 401));
    }

    req.user = user;
    next();
  } catch (e) {
    return next(new AppError('Invalid or expired token', 401));
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }
    if (req.user.role !== role) {
      return next(new AppError('Forbidden', 403));
    }
    next();
  };
}

module.exports = { auth, requireRole };
