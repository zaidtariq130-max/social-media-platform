const Post = require("../models/Post");
const AppError = require("../utils/AppError");

// Authors are shown by username only; emails are never exposed in the feed.
const AUTHOR_FIELDS = "username";

const getOwnedPost = async (postId, userId, action) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError(404, "Post not found");
  if (post.user.toString() !== String(userId)) {
    throw new AppError(403, `You can only ${action} your own post`);
  }
  return post;
};

const createPost = async (userId, content) => {
  const post = await Post.create({ user: userId, content });
  return post.populate("user", AUTHOR_FIELDS);
};

const listPosts = async ({ page, limit }) => {
  const [posts, total] = await Promise.all([
    Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", AUTHOR_FIELDS)
      .lean(),
    Post.countDocuments(),
  ]);

  return { posts, pagination: { page, limit, total, hasMore: page * limit < total } };
};

const updatePost = async (userId, postId, content) => {
  const post = await getOwnedPost(postId, userId, "edit");
  post.content = content;
  await post.save();
  return post.populate("user", AUTHOR_FIELDS);
};

const deletePost = async (userId, postId) => {
  const post = await getOwnedPost(postId, userId, "delete");
  await post.deleteOne();
};

module.exports = { createPost, listPosts, updatePost, deletePost };
