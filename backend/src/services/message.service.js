const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const AppError = require("../utils/AppError");
const { idOf, assertValidId } = require("../utils/id");
const { emitToUsers, userRoom } = require("../socket/emitter");
const presence = require("../socket/presence");
const { LIMITS, MESSAGE_STATUS, SOCKET_EVENTS } = require("../config/constants");
const { serializeMessage } = require("../serializers/message.serializer");
const { getClearedAtMs } = require("../serializers/conversation.serializer");
const { getConversationForUser, participantIdsOf, othersOf } = require("./conversation.service");
const { areFriends } = require("./friend.service");

/**
 * Saves a message and pushes it to everyone in the conversation in real time.
 * Used by both the socket `message:send` event and the REST fallback endpoint.
 *
 * @param senderSocket optional socket of the sender: it is skipped for the live
 *        push (it gets the message through its ack instead), other tabs still get it.
 */
const sendMessage = async ({ conversationId, senderId, text, senderSocket }) => {
  const clean = typeof text === "string" ? text.trim() : "";
  if (!clean) throw new AppError(400, "Message text is required");
  if (clean.length > LIMITS.MESSAGE_MAX) {
    throw new AppError(400, `Message is too long (max ${LIMITS.MESSAGE_MAX} characters)`);
  }

  const conversation = await getConversationForUser(conversationId, senderId);

  if (conversation.blockedBy && conversation.blockedBy.length > 0) {
    throw new AppError(403, "You can't send messages in this conversation");
  }

  const recipientIds = othersOf(conversation, senderId);

  // 1-to-1 chats work only while both users are friends (e.g. after unfriending, chat stops)
  if (!conversation.isGroup && !(await areFriends(senderId, recipientIds[0]))) {
    throw new AppError(403, "You can only message your friends");
  }

  const message = await Message.create({
    conversationId: conversation._id,
    sender: senderId,
    ...(!conversation.isGroup && recipientIds[0] && { receiver: recipientIds[0] }),
    text: clean,
    // somebody on the other end is connected right now -> already delivered
    status: recipientIds.some(presence.isOnline) ? MESSAGE_STATUS.DELIVERED : MESSAGE_STATUS.SENT,
  });

  await Conversation.updateOne(
    { _id: conversation._id },
    {
      $set: { lastMessage: clean, lastMessageTime: message.createdAt },
      $push: { messages: message._id },
    }
  );

  const shaped = serializeMessage(message);
  const payload = { conversationId: idOf(conversation), message: shaped };

  emitToUsers(recipientIds, SOCKET_EVENTS.MESSAGE_NEW, payload);
  if (senderSocket) senderSocket.to(userRoom(senderId)).emit(SOCKET_EVENTS.MESSAGE_NEW, payload);
  else emitToUsers([senderId], SOCKET_EVENTS.MESSAGE_NEW, payload);

  return shaped;
};

/**
 * One page of history, oldest -> newest. Pass `before` (a date) to get older messages.
 * @returns {{ messages: object[], hasMore: boolean }}
 */
const listMessages = async (userId, conversationId, { limit, before }) => {
  const conversation = await getConversationForUser(conversationId, userId);

  const createdAt = {};
  const clearedAtMs = getClearedAtMs(conversation, userId);
  if (clearedAtMs) createdAt.$gt = new Date(clearedAtMs);
  if (before) createdAt.$lt = before;

  const query = { conversationId: conversation._id, deletedFor: { $ne: userId } };
  if (Object.keys(createdAt).length > 0) query.createdAt = createdAt;

  // ask for one extra row to know whether there is another page
  const rows = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit).reverse();

  return { messages: page.map(serializeMessage), hasMore };
};

/** Marks everything the other side sent as read and tells all participants. */
const markConversationRead = async ({ conversationId, userId, userSocket }) => {
  const conversation = await getConversationForUser(conversationId, userId);

  const result = await Message.updateMany(
    {
      conversationId: conversation._id,
      sender: { $ne: userId },
      status: { $ne: MESSAGE_STATUS.READ },
    },
    { $set: { status: MESSAGE_STATUS.READ } }
  );

  if (result.modifiedCount > 0) {
    const payload = { conversationId: idOf(conversation), readerId: String(userId) };
    const targets = participantIdsOf(conversation);
    if (userSocket) {
      // the reader's own tab already knows; everyone else (incl. their other tabs) is told
      const rooms = [...new Set(targets)].map(userRoom);
      userSocket.to(rooms).emit(SOCKET_EVENTS.MESSAGES_READ, payload);
    } else {
      emitToUsers(targets, SOCKET_EVENTS.MESSAGES_READ, payload);
    }
  }
  return result.modifiedCount;
};

const findMessageInConversation = async (conversation, messageId) => {
  assertValidId(messageId);
  const message = await Message.findOne({ _id: messageId, conversationId: conversation._id });
  if (!message) throw new AppError(404, "Message not found");
  return message;
};

/** Delete for everyone. Only the sender may do it. */
const deleteMessage = async (userId, conversationId, messageId) => {
  const conversation = await getConversationForUser(conversationId, userId);
  const message = await findMessageInConversation(conversation, messageId);

  if (idOf(message.sender) !== String(userId)) throw new AppError(403, "Forbidden");

  await message.deleteOne();
  await Conversation.updateOne({ _id: conversation._id }, { $pull: { messages: message._id } });

  emitToUsers(othersOf(conversation, userId), SOCKET_EVENTS.MESSAGE_DELETED, {
    conversationId: idOf(conversation),
    messageId: idOf(message),
  });
};

/** Hide a message for this user only. */
const deleteMessageForMe = async (userId, conversationId, messageId) => {
  const conversation = await getConversationForUser(conversationId, userId);
  const message = await findMessageInConversation(conversation, messageId);

  await Message.updateOne({ _id: message._id }, { $addToSet: { deletedFor: userId } });
};

module.exports = {
  sendMessage,
  listMessages,
  markConversationRead,
  deleteMessage,
  deleteMessageForMe,
};
