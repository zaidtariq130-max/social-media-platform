const express = require("express");

const router = express.Router();

router.use("/auth", require("./auth.routes"));
router.use("/posts", require("./post.routes"));
router.use("/users", require("./user.routes"));
router.use("/friends", require("./friend.routes"));
router.use("/conversations", require("./conversation.routes"));
router.use("/chatbot", require("./chatbot.routes"));

module.exports = router;
