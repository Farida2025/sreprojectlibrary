const User = require('../models/User');
const AppError = require('../utils/appError');
exports.me = async (req, res, next) => {
  res.json(req.user);
};

exports.getAll = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    next(new AppError('Failed to fetch users', 400, e.message));
  }
};

exports.remove = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    if (user.role === 'admin') return next(new AppError('Cannot delete admin user', 403));
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User deleted' });
  } catch (e) {
    next(new AppError('Failed to delete user', 400, e.message));
  }
};
