const postService = require("../services/post.service");
const { sendSuccess } = require("../utils/response");

const createPost = async (req, res) => {
  const post = await postService.createPost(req.user.id, req.body.content);
  return sendSuccess(res, { message: "Post created successfully", post }, 201);
};

const getPosts = async (req, res) => {
  const { posts, pagination } = await postService.listPosts(req.validatedQuery);
  return sendSuccess(res, { message: "Posts fetched successfully", posts, pagination });
};

const updatePost = async (req, res) => {
  const post = await postService.updatePost(req.user.id, req.params.id, req.body.content);
  return sendSuccess(res, { message: "Post updated successfully", post });
};

const deletePost = async (req, res) => {
  await postService.deletePost(req.user.id, req.params.id);
  return sendSuccess(res, { message: "Post deleted successfully" });
};

module.exports = { createPost, getPosts, updatePost, deletePost };
