const express = require("express");

const router = express.Router();

const {
  createPost,
  getPosts,
  updatePost,
  deletePost
} = require("../controllers/postController");

const authMiddleware = require("../middleware/authMiddleware");


router.post("/", authMiddleware, createPost);

router.get("/", authMiddleware, getPosts);

router.put("/:id", authMiddleware, updatePost);

router.delete("/:id", authMiddleware, deletePost);


module.exports = router;