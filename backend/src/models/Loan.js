const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  borrowedAt: { type: Date, default: Date.now },
  returnedAt: { type: Date, default: null }
});

LoanSchema.index(
  { userId: 1, bookId: 1 },
  { unique: true, partialFilterExpression: { returnedAt: null } }
);


module.exports = mongoose.model('Loan', LoanSchema);
