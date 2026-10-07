const Post = require("../models/Post");


const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Post content is required"
      });
    }

    const post = await Post.create({
      user: req.user.id,
      content: content.trim()
    });

    const populatedPost = await Post.findById(post._id)
      .populate("user", "username email");

    return res.status(201).json({
      message: "Post created successfully",
      post: populatedPost
    });

  } catch (error) {
    console.error("Create post error:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};


const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Posts fetched successfully",
      posts
    });

  } catch (error) {
    console.error("Get posts error:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};


const updatePost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Post content is required"
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only edit your own post"
      });
    }

    post.content = content.trim();

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("user", "username email");

    return res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost
    });

  } catch (error) {
    console.error("Update post error:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};


const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete your own post"
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Post deleted successfully"
    });

  } catch (error) {
    console.error("Delete post error:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};


module.exports = {
  createPost,
  getPosts,
  updatePost,
  deletePost
};