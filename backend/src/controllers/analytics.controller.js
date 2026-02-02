const Loan = require('../models/Loan');
const AppError = require('../utils/appError');

exports.topBooks = async (req, res, next) => {
  try {
    const result = await Loan.aggregate([
      { $match: { returnedAt: null } },
      { $group: { _id: "$bookId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book"
        }
      },
      { $unwind: "$book" },
      { $project: { _id: 0, bookId: "$book._id", title: "$book.title", author: "$book.author", count: 1 } }
    ]);
    res.json(result);
  } catch (e) {
    next(new AppError('Analytics failed', 400, e.message));
  }
};

exports.topAuthors = async (req, res, next) => {
  try {
    const result = await Loan.aggregate([
      { $match: { returnedAt: null } }, 
      {
        $lookup: {
          from: "books",
          localField: "bookId",
          foreignField: "_id",
          as: "bookInfo"
        }
      },
      { $unwind: "$bookInfo" },
      { $group: { _id: "$bookInfo.author", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, author: "$_id", count: 1 } }
    ]);
    res.json(result);
  } catch (e) {
    next(new AppError('Analytics failed', 400, e.message));
  }
};

exports.topCategories = async (req, res, next) => {
  try {
    const result = await Loan.aggregate([
      { $match: { returnedAt: null } },
      {
        $lookup: {
          from: "books",
          localField: "bookId",
          foreignField: "_id",
          as: "book"
        }
      },
      { $unwind: "$book" },
      { $group: { _id: "$book.category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, category: "$_id", count: 1 } }
    ]);
    res.json(result);
  } catch (e) {
    next(new AppError('Analytics failed', 400, e.message));
  }
};
