const mongoose = require('mongoose');
const BookMetadataSchema = new mongoose.Schema({
  timesBorrowed: { type: Number, default: 0 },
  rating: { type: Number, default: 0 }
}, { _id: false });
const BookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  author: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, required: true, trim: true, maxlength: 80 },

  coverUrl: { type: String, default: "" },  

  availableCopies: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now },
  metadata: { type: BookMetadataSchema, default: () => ({}) },
  tags: { type: [String], default: [] }
});

BookSchema.index({ author: 1, category: 1 });
module.exports = mongoose.model('Book', BookSchema);
