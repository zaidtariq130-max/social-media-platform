const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getConversations,
  createConversation,
  createGroupConversation,
  acceptConversation,
  deleteConversation,
  clearMessages,
  toggleBlockConversation,
  getMessages,
  sendMessage,
  deleteMessage,
  deleteMessageForMe,
} = require("../controllers/conversationController");

// All routes are protected
router.use(authMiddleware);

// Conversations
router.get("/", getConversations);
router.post("/", createConversation);
router.post("/group", createGroupConversation);
router.put("/:id/accept", acceptConversation);
router.put("/:id/clear", clearMessages);
router.put("/:id/block", toggleBlockConversation);
router.delete("/:id", deleteConversation);

// Messages within a conversation
router.get("/:id/messages", getMessages);
router.post("/:id/messages", sendMessage);
router.delete("/:id/messages/:messageId", deleteMessage);
router.put("/:id/messages/:messageId/delete-for-me", deleteMessageForMe);

module.exports = router;
