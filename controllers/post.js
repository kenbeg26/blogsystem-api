// Dependencies and Modules
const Post = require("../models/Post");
const auth = require("../auth");
const { errorHandler } = auth;

// Create Post
module.exports.addPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "All fields (title, content) are required" });
    }

    // User info is now available from the middleware
    const userId = req.user.id;

    const newPost = new Post({
      title,
      content,
      author: userId
    });

    const savedPost = await newPost.save();

    return res.status(201).json({
      _id: savedPost._id,
      title: savedPost.title,
      content: savedPost.content,
      author: savedPost.author,
      createdAt: savedPost.createdAt
    });

  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// Retrieve all post
module.exports.getAllPosts = (req, res) => {
  Post.find({})
    .then(posts => {
      console.log("Post found:", posts);
      res.status(200).json(posts);
    })
    .catch(error => errorHandler(error, req, res));
};

// Retrieve user post
module.exports.getUserPosts = (req, res) => {
  const userId = req.user.id;

  Post.find({ author: userId })
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(error => errorHandler(error, req, res));
};


// Update post
module.exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { title, content } = req.body;

    // Validate input
    if (!title || !content) {
      return res.status(400).json({ error: "All fields (title, content) are required" });
    }

    // Find the post to be updated
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Ensure the logged-in user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to update this post" });
    }

    // Update post fields
    post.title = title;
    post.content = content;

    const updatedPost = await post.save();

    return res.status(200).json({
      message: "Post updated successfully",
      post: {
        _id: updatedPost._id,
        title: updatedPost.title,
        content: updatedPost.content,
        author: updatedPost.author,
        updatedAt: updatedPost.updatedAt
      }
    });

  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// Delete Post
module.exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    // Find the post by ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the logged-in user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to delete this post" });
    }

    // Delete the post
    await Post.findByIdAndDelete(postId);

    return res.status(200).json({ message: "Post deleted successfully" });

  } catch (error) {
    return errorHandler(error, req, res);
  }
};


// DELETE /deleteAnyPost/:postId - Admin deletes any post
module.exports.deletePost = async (req, res) => {
  const { postId } = req.params;

  try {
    // Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Delete the post
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error while deleting post' });
  }
};