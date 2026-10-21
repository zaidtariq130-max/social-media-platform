const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { idOf, assertValidId, directKeyOf } = require("../utils/id");
const { emitToUsers } = require("../socket/emitter");
const { CHAT, SOCKET_EVENTS, USER_HIDDEN_FIELDS } = require("../config/constants");
const { areFriends, assertAllFriends } = require("./friend.service");
const { serializeUser } = require("../serializers/user.serializer");
const { serializeConversation } = require("../serializers/conversation.serializer");

const participantIdsOf = (conversation) => conversation.participants.map(idOf);

const othersOf = (conversation, userId) =>
  participantIdsOf(conversation).filter((id) => id !== String(userId));

/** Loads a conversation and makes sure `userId` is part of it. */
const getConversationForUser = async (conversationId, userId) => {
  assertValidId(conversationId);
  // the (potentially huge) messages array is never needed for access checks
  const conversation = await Conversation.findById(conversationId).select("-messages");
  if (!conversation) throw new AppError(404, "Conversation not found");
  if (!participantIdsOf(conversation).includes(String(userId))) {
    throw new AppError(403, "Forbidden");
  }
  return conversation;
};

/** Conversation with users + recent messages filled in, ready for the serializer. */
const loadForClient = (conversationId) =>
  Conversation.findById(conversationId)
    .select({ messages: { $slice: -CHAT.PRELOAD_MESSAGES } })
    .populate("participants", USER_HIDDEN_FIELDS)
    .populate("messages");

/** Pushes an already-loaded conversation to the given users, shaped for each of them. */
const pushConversationToUsers = (populated, userIds) => {
  userIds.forEach((userId) => {
    emitToUsers([userId], SOCKET_EVENTS.CONVERSATION_NEW, {
      conversation: serializeConversation(populated, userId),
    });
  });
};

const emitConversationNew = async (conversationId, userIds) => {
  const populated = await loadForClient(conversationId);
  if (populated) pushConversationToUsers(populated, userIds);
};

const listConversations = async (userId) => {
  const conversations = await Conversation.find({ participants: userId })
    // only the latest messages per chat; older ones come from GET /:id/messages?before=
    .select({ messages: { $slice: -CHAT.PRELOAD_MESSAGES } })
    .populate("participants", USER_HIDDEN_FIELDS)
    .populate("messages")
    .sort({ lastMessageTime: -1 });

  return conversations.map((conv) => serializeConversation(conv, userId));
};

/** Starts a 1-to-1 chat, or returns the one that already exists. */
const createDirectConversation = async (userId, participantId) => {
  if (String(participantId) === String(userId)) {
    throw new AppError(400, "You can't start a conversation with yourself");
  }

  const otherUser = await User.findById(participantId).select(USER_HIDDEN_FIELDS);
  if (!otherUser) throw new AppError(404, "User not found");

  const directKey = directKeyOf(userId, participantId);

  // directKey is the fast path; the second condition finds chats created before directKey existed
  let conversation = await Conversation.findOne({
    $or: [
      { directKey },
      { isGroup: { $ne: true }, participants: { $all: [userId, participantId], $size: 2 } },
    ],
  });
  let existing = Boolean(conversation);

  if (conversation && !conversation.directKey) {
    // old chat: stamp it so the unique index protects it from now on
    await Conversation.updateOne({ _id: conversation._id }, { $set: { directKey } }).catch(() => {});
  }

  if (!conversation) {
    // a new chat can only be started with an accepted friend
    if (!(await areFriends(userId, participantId))) {
      throw new AppError(403, "You can only message your friends. Send a friend request first.");
    }
    try {
      conversation = await Conversation.create({
        participants: [userId, participantId],
        directKey,
      });
      await emitConversationNew(conversation._id, [participantId]);
    } catch (err) {
      // two calls raced: the other one won, so just use its chat
      if (err.code !== 11000) throw err;
      conversation = await Conversation.findOne({ directKey });
      existing = true;
    }
  }

  return {
    existing,
    conversation: {
      id: idOf(conversation),
      participant: serializeUser(otherUser),
    },
  };
};

const createGroupConversation = async (userId, { name, participantIds }) => {
  const memberIds = [...new Set([String(userId), ...participantIds.map(String)])];
  if (memberIds.length < 2) {
    throw new AppError(400, "At least one other participant is required");
  }

  const found = await User.countDocuments({ _id: { $in: memberIds } });
  if (found !== memberIds.length) throw new AppError(400, "One or more users were not found");

  // everyone in a group must be a friend of the person creating it
  await assertAllFriends(
    userId,
    memberIds.filter((id) => id !== String(userId))
  );

  const group = await Conversation.create({
    participants: memberIds,
    isGroup: true,
    groupName: name || "Group Chat",
    lastMessage: "Group created",
    lastMessageTime: Date.now(),
  });

  const populated = await loadForClient(group._id);
  pushConversationToUsers(
    populated,
    memberIds.filter((id) => id !== String(userId))
  );

  return serializeConversation(populated, userId);
};

const deleteConversation = async (userId, conversationId) => {
  const conversation = await getConversationForUser(conversationId, userId);
  const others = othersOf(conversation, userId);

  await Message.deleteMany({ conversationId: conversation._id });
  await conversation.deleteOne();

  emitToUsers(others, SOCKET_EVENTS.CONVERSATION_DELETED, { conversationId: idOf(conversation) });
};

/** "Clear chat" hides old messages for this user only. */
const clearMessages = async (userId, conversationId) => {
  const conversation = await getConversationForUser(conversationId, userId);

  if (!conversation.clearedAt) conversation.clearedAt = new Map();
  conversation.clearedAt.set(String(userId), new Date());

  await conversation.save();

  emitToUsers([userId], SOCKET_EVENTS.CONVERSATION_CLEARED, {
    conversationId: idOf(conversation),
  });

};

/** @returns {boolean} true if the user is now blocked */
const toggleBlock = async (userId, conversationId) => {
  const conversation = await getConversationForUser(conversationId, userId);
  const me = String(userId);

  const wasBlocked = (conversation.blockedBy || []).some((b) => idOf(b) === me);
  conversation.blockedBy = wasBlocked
    ? conversation.blockedBy.filter((b) => idOf(b) !== me)
    : [...(conversation.blockedBy || []), userId];

  await conversation.save();
  return !wasBlocked;
};

module.exports = {
  participantIdsOf,
  othersOf,
  getConversationForUser,
  listConversations,
  createDirectConversation,
  createGroupConversation,
  deleteConversation,
  clearMessages,
  toggleBlock,
};
