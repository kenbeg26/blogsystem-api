const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Add Comment
module.exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    // Use req.user.id instead of req.user._id
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication missing or invalid'
      });
    }

    const userId = req.user.id; // Changed from _id to id

    // Rest of your validation...
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Valid comment content is required'
      });
    }

    // Check post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Create and save comment
    const comment = await Comment.create({
      post: postId,
      author: userId, // This will now work with your middleware's user.id
      content: content.trim()
    });

    // Populate and return
    const result = await Comment.findById(comment._id)
      .populate('author', 'username email')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: result
    });

  } catch (error) {
    console.error('Error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Retrieve Comment
module.exports.getComment = async (req, res) => {
  try {
    // Extract postId from URL params
    const { postId } = req.params;

    // Validate postId format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
        error: `Received: ${postId}`
      });
    }

    // Configuration
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || '-createdAt';

    // Check post existence
    const post = await Post.findById(postId).select('_id');
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Get comments with optimized query
    const [comments, total] = await Promise.all([
      Comment.find({ post: postId })
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .populate('author', 'username avatar')
        .lean(),
      Comment.countDocuments({ post: postId })
    ]);

    return res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching comments:', {
      error: error.message,
      params: req.params,
      query: req.query,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
        stack: error.stack
      })
    });
  }
};