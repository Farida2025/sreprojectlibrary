const mongoose = require('mongoose');

const BorrowStatsSchema = new mongoose.Schema({
  totalBorrowed: { type: Number, default: 0 },
  currentlyBorrowed: { type: Number, default: 0 },
  lastBorrowedDate: { type: Date, default: null }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  borrowStats: { type: BorrowStatsSchema, default: () => ({}) }
});


module.exports = mongoose.model('User', UserSchema);
