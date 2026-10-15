const express = require("express");
const router = express.Router();
const { getUsers } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/users — protected: only logged-in users can fetch others
router.get("/", authMiddleware, getUsers);

module.exports = router;
