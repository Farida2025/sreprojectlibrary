const Book = require('../models/Book');
const AppError = require('../utils/appError');
exports.getAll = async (req, res, next) => {
  try {
    const { author, category, q, sort = 'createdAt', order = 'desc', page = '1', limit = '20' } = req.query;

    const filter = {};
    if (author) filter.author = new RegExp(author, 'i');
    if (category) filter.category = new RegExp(category, 'i');
    if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { author: new RegExp(q, 'i') }];

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

    const [items, total] = await Promise.all([
      Book.find(filter).sort(sortObj).skip(skip).limit(limitNum),
      Book.countDocuments(filter)
    ]);

    res.json({ items, page: pageNum, limit: limitNum, total });
  } catch (e) {
    next(new AppError('Failed to fetch books', 400, e.message));
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return next(new AppError('Book not found', 404));
    res.json(book);
  } catch (e) {
    next(new AppError('Failed to fetch book', 400, e.message));
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, author, category, availableCopies, tags, coverUrl } = req.body;


    const copies = Number(availableCopies);
    if (Number.isNaN(copies) || copies < 0) {
      return next(new AppError('availableCopies must be >= 0', 400));
    }

    const book = await Book.create({
  title,
  author,
  category,
  coverUrl: String(coverUrl || "").trim(),   
  availableCopies: copies,
  tags: Array.isArray(tags) ? tags : []
});


    res.status(201).json(book);
  } catch (e) {
    next(new AppError('Failed to create book', 400, e.message));
  }
};



exports.update = async (req, res, next) => {
  try {
    const { title, author, category, availableCopies, coverUrl } = req.body;


    const patch = {};
    if (coverUrl !== undefined) {
  patch.coverUrl = String(coverUrl || "").trim();
}

    if (title !== undefined) patch.title = title;
    if (author !== undefined) patch.author = author;
    if (category !== undefined) patch.category = category;
    if (availableCopies !== undefined) {
      const copies = Number(availableCopies);
      if (Number.isNaN(copies) || copies < 0) return next(new AppError('availableCopies must be >= 0', 400));
      patch.availableCopies = copies;
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: patch },
      { new: true, runValidators: true }
    );

    if (!book) return next(new AppError('Book not found', 404));
    res.json(book);
  } catch (e) {
    next(new AppError('Failed to update book', 400, e.message));
  }
};


exports.remove = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return next(new AppError('Book not found', 404));
    res.json({ message: 'Book deleted' });
  } catch (e) {
    next(new AppError('Failed to delete book', 400, e.message));
  }
};

exports.addTag = async (req, res, next) => {
  try {
    const { tag } = req.body;

    const clean = String(tag || '').trim();
    if (!clean) {
      return next(new AppError('tag is required', 400));
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { tags: clean.toLowerCase() } },
      { new: true }
    );

    if (!book) return next(new AppError('Book not found', 404));
    res.json(book);
  } catch (e) {
    next(new AppError('Failed to add tag', 400, e.message));
  }
};


exports.removeTag = async (req, res, next) => {
  try {
    const { tag } = req.body;

    const clean = String(tag || '').trim();
    if (!clean) {
      return next(new AppError('tag is required', 400));
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { $pull: { tags: clean.toLowerCase() } },
      { new: true }
    );

    if (!book) return next(new AppError('Book not found', 404));
    res.json(book);
  } catch (e) {
    next(new AppError('Failed to remove tag', 400, e.message));
  }
};

