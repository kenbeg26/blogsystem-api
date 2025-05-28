// Dependency
const mongoose = require('mongoose');

// Define Post Schema
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
}, {
  timestamps: true // automatically adds createdAt and updatedAt
});

// Export Post Model
module.exports = mongoose.model('Post', postSchema);
