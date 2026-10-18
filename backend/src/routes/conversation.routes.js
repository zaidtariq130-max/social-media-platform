const express = require("express");
const controller = require("../controllers/conversation.controller");
const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { idParam } = require("../validators/common.validator");
const {
  createConversationBody,
  createGroupBody,
  sendMessageBody,
  messageParams,
  listMessagesQuery,
} = require("../validators/conversation.validator");

const router = express.Router();

// every conversation route is protected
router.use(authenticate);

// Conversations
router.get("/", controller.getConversations);
router.post("/", validate({ body: createConversationBody }), controller.createConversation);
router.post("/group", validate({ body: createGroupBody }), controller.createGroupConversation);
router.put("/:id/accept", validate({ params: idParam }), controller.acceptConversation);
router.put("/:id/clear", validate({ params: idParam }), controller.clearMessages);
router.put("/:id/block", validate({ params: idParam }), controller.toggleBlockConversation);
router.delete("/:id", validate({ params: idParam }), controller.deleteConversation);

// Messages inside a conversation
router.get(
  "/:id/messages",
  validate({ params: idParam, query: listMessagesQuery }),
  controller.getMessages
);
router.post(
  "/:id/messages",
  validate({ params: idParam, body: sendMessageBody }),
  controller.sendMessage
);
router.delete(
  "/:id/messages/:messageId",
  validate({ params: messageParams }),
  controller.deleteMessage
);
router.put(
  "/:id/messages/:messageId/delete-for-me",
  validate({ params: messageParams }),
  controller.deleteMessageForMe
);

module.exports = router;
