const mongoose = require('mongoose');
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const User = require('../models/User');
const AppError = require('../utils/appError');

exports.borrow = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.body;

    if (!bookId) throw new AppError('bookId is required', 400);
    const existing = await Loan.findOne({ userId, bookId, returnedAt: null });
    if (existing) throw new AppError('You already borrowed this book', 400);

    let book = null;

    try {
      book = await Book.findOneAndUpdate(
        { _id: bookId, availableCopies: { $gt: 0 } },
        { $inc: { availableCopies: -1, 'metadata.timesBorrowed': 1 } },
        { new: true }
      );

      if (!book) throw new AppError('No available copies or book not found', 400);

      const loan = await Loan.create({
        userId,
        bookId,
        borrowedAt: new Date(),
        returnedAt: null
      });

      await User.updateOne(
        { _id: userId },
        {
          $inc: { 'borrowStats.totalBorrowed': 1, 'borrowStats.currentlyBorrowed': 1 },
          $set: { 'borrowStats.lastBorrowedDate': new Date() }
        }
      );

      return res.status(201).json({ message: 'Book borrowed', loan });
    } catch (e) {
      if (book) {
        await Book.updateOne({ _id: bookId }, { $inc: { availableCopies: 1 } });
      }
      throw e; 
    }
  } catch (e) {
    next(e instanceof AppError ? e : new AppError('Borrow failed', 400, e.message));
  }
};


exports.returnBook = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.body;

    const loan = await Loan.findOne({ userId, bookId, returnedAt: null });
    if (!loan) throw new AppError('Active loan not found for this user/book', 404);

    loan.returnedAt = new Date();
    await loan.save();
    await Book.updateOne(
      { _id: bookId },
      { $inc: { availableCopies: 1 } }
    );
    await User.updateOne(
      { _id: userId },
      { $inc: { 'borrowStats.currentlyBorrowed': -1 } }
    );

    res.json({ message: 'Book returned', loan });
  } catch (e) {
    next(e instanceof AppError ? e : new AppError('Return failed', 400, e.message));
  }
};

exports.myLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ userId: req.user._id })
      .populate('bookId', 'title author category')
      .sort({ borrowedAt: -1 });
    res.json(loans);
  } catch (e) {
    next(new AppError('Failed to fetch loans', 400, e.message));
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const loans = await Loan.find({})
      .populate('userId', 'name email')
      .populate('bookId', 'title author')
      .sort({ borrowedAt: -1 });
    res.json(loans);
  } catch (e) {
    next(new AppError('Failed to fetch loans', 400, e.message));
  }
};

exports.remove = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return next(new AppError('Loan not found', 404));
    if (loan.returnedAt === null) return next(new AppError('Cannot delete an active loan (return it first)', 400));

    await Loan.deleteOne({ _id: loan._id });
    res.json({ message: 'Loan deleted' });
  } catch (e) {
    next(new AppError('Failed to delete loan', 400, e.message));
  }
};
