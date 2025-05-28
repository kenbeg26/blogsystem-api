// Dependency
const mongoose = require('mongoose');

// Define Comment Schema
const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post reference is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  }
}, {
  timestamps: true // automatically adds createdAt and updatedAt
});

// Export Comment Model
module.exports = mongoose.model('Comment', commentSchema);