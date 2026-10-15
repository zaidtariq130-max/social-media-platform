const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const ChatError = require("../utils/ChatError");
const { idOf, shapeMessage, shapeConversation } = require("../utils/shapers");
const { emitToUsers, userRoom } = require("../socket/emitter");
const presence = require("../socket/presence");

const MAX_MESSAGE_LENGTH = 2000;

const POPULATE_USER_FIELDS = "-password -refreshTokenHash";

const assertValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new ChatError(400, "Invalid ID");
};

/** Loads a conversation and makes sure `userId` is part of it. */
const getConversationForUser = async (conversationId, userId) => {
  assertValidId(conversationId);
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ChatError(404, "Conversation not found");
  if (!conversation.participants.some((p) => idOf(p) === String(userId))) {
    throw new ChatError(403, "Forbidden");
  }
  return conversation;
};

const participantIdsOf = (conversation) => conversation.participants.map(idOf);

const othersOf = (conversation, userId) =>
  participantIdsOf(conversation).filter((id) => id !== String(userId));

/**
 * Saves a message and pushes it to everyone in the conversation in real time.
 * Used by both the socket `message:send` event and the REST fallback endpoint.
 *
 * @param senderSocket optional socket of the sender: it is skipped for the live
 *        push (it gets the message through its ack instead), other tabs still get it.
 */
const sendChatMessage = async ({ conversationId, senderId, text, senderSocket }) => {
  const clean = typeof text === "string" ? text.trim() : "";
  if (!clean) throw new ChatError(400, "Message text is required");
  if (clean.length > MAX_MESSAGE_LENGTH) {
    throw new ChatError(400, `Message is too long (max ${MAX_MESSAGE_LENGTH} characters)`);
  }

  const conversation = await getConversationForUser(conversationId, senderId);

  if (conversation.blockedBy && conversation.blockedBy.length > 0) {
    throw new ChatError(403, "You can't send messages in this conversation");
  }
  // Only the person who sent the request may write until the other side accepts.
  if (
    conversation.requestStatus === "pending" &&
    conversation.requestedBy &&
    idOf(conversation.requestedBy) !== String(senderId)
  ) {
    throw new ChatError(403, "Accept the message request to reply");
  }

  const recipientIds = othersOf(conversation, senderId);

  const message = await Message.create({
    conversationId: conversation._id,
    sender: senderId,
    ...(!conversation.isGroup && recipientIds[0] && { receiver: recipientIds[0] }),
    text: clean,
    // somebody on the other end is connected right now -> already delivered
    status: recipientIds.some(presence.isOnline) ? "delivered" : "sent",
  });

  conversation.lastMessage = clean;
  conversation.lastMessageTime = message.createdAt;
  conversation.messages.push(message._id);
  await conversation.save();

  const shaped = shapeMessage(message);
  const payload = { conversationId: idOf(conversation), message: shaped };

  emitToUsers(recipientIds, "message:new", payload);
  if (senderSocket) senderSocket.to(userRoom(senderId)).emit("message:new", payload);
  else emitToUsers([senderId], "message:new", payload);

  return shaped;
};

/** Marks everything the other side sent as read and tells all participants. */
const markConversationRead = async ({ conversationId, userId, userSocket }) => {
  const conversation = await getConversationForUser(conversationId, userId);

  const result = await Message.updateMany(
    { conversationId: conversation._id, sender: { $ne: userId }, status: { $ne: "read" } },
    { $set: { status: "read" } }
  );

  if (result.modifiedCount > 0) {
    const payload = { conversationId: idOf(conversation), readerId: String(userId) };
    const targets = participantIdsOf(conversation);
    if (userSocket) {
      // the reader's own tab already knows; everyone else (incl. their other tabs) is told
      const rooms = [...new Set(targets)].map(userRoom);
      userSocket.to(rooms).emit("messages:read", payload);
    } else {
      emitToUsers(targets, "messages:read", payload);
    }
  }
  return result.modifiedCount;
};

/** Pushes a freshly created conversation to the given users, shaped for each of them. */
const emitConversationNew = async (conversationId, userIds) => {
  const populated = await Conversation.findById(conversationId)
    .populate("participants", POPULATE_USER_FIELDS)
    .populate("messages");
  if (!populated) return;
  userIds.forEach((userId) => {
    emitToUsers([userId], "conversation:new", {
      conversation: shapeConversation(populated, userId),
    });
  });
};

module.exports = {
  POPULATE_USER_FIELDS,
  getConversationForUser,
  participantIdsOf,
  othersOf,
  sendChatMessage,
  markConversationRead,
  emitConversationNew,
};
