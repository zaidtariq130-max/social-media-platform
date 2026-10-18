const conversationService = require("../services/conversation.service");
const messageService = require("../services/message.service");
const { sendSuccess } = require("../utils/response");

// ---- conversations ----

const getConversations = async (req, res) => {
  const conversations = await conversationService.listConversations(req.user.id);
  return sendSuccess(res, { conversations });
};

const createConversation = async (req, res) => {
  const { conversation, existing } = await conversationService.createDirectConversation(
    req.user.id,
    req.body.participantId
  );
  return sendSuccess(res, { conversation, existing }, existing ? 200 : 201);
};

const createGroupConversation = async (req, res) => {
  const conversation = await conversationService.createGroupConversation(req.user.id, req.body);
  return sendSuccess(res, { conversation }, 201);
};

const acceptConversation = async (req, res) => {
  await conversationService.acceptConversation(req.user.id, req.params.id);
  return sendSuccess(res, { message: "Request accepted" });
};

const deleteConversation = async (req, res) => {
  await conversationService.deleteConversation(req.user.id, req.params.id);
  return sendSuccess(res, { message: "Conversation deleted" });
};

const clearMessages = async (req, res) => {
  await conversationService.clearMessages(req.user.id, req.params.id);
  return sendSuccess(res, { message: "Chat messages cleared" });
};

const toggleBlockConversation = async (req, res) => {
  const isBlocked = await conversationService.toggleBlock(req.user.id, req.params.id);
  return sendSuccess(res, { isBlocked, message: isBlocked ? "User blocked" : "User unblocked" });
};

// ---- messages ----

const getMessages = async (req, res) => {
  const { messages, hasMore } = await messageService.listMessages(
    req.user.id,
    req.params.id,
    req.validatedQuery
  );
  return sendSuccess(res, { messages, hasMore });
};

const sendMessage = async (req, res) => {
  const message = await messageService.sendMessage({
    conversationId: req.params.id,
    senderId: req.user.id,
    text: req.body.text,
  });
  return sendSuccess(res, { message }, 201);
};

const deleteMessage = async (req, res) => {
  await messageService.deleteMessage(req.user.id, req.params.id, req.params.messageId);
  return sendSuccess(res, { message: "Message deleted" });
};

const deleteMessageForMe = async (req, res) => {
  await messageService.deleteMessageForMe(req.user.id, req.params.id, req.params.messageId);
  return sendSuccess(res, { message: "Message deleted for you" });
};

module.exports = {
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
};
