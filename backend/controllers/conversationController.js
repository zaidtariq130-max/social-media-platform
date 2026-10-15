const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const ChatError = require("../utils/ChatError");
const { idOf, shapeUser, shapeMessage, shapeConversation, clearedAtMsFor } = require("../utils/shapers");
const { emitToUsers } = require("../socket/emitter");
const {
  POPULATE_USER_FIELDS,
  getConversationForUser,
  participantIdsOf,
  othersOf,
  sendChatMessage,
  emitConversationNew,
} = require("../services/chatService");

// Turns a thrown ChatError into the matching HTTP response; anything else is a 500.
const handleError = (res, label, error) => {
  if (error instanceof ChatError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error(`${label} error:`, error);
  return res.status(500).json({ success: false, message: "Server error" });
};

// GET /api/conversations — all conversations of the logged-in user
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate("participants", POPULATE_USER_FIELDS)
      .populate("messages")
      .sort({ lastMessageTime: -1 });

    res.status(200).json({
      success: true,
      conversations: conversations.map((conv) => shapeConversation(conv, req.user.id)),
    });
  } catch (error) {
    handleError(res, "getConversations", error);
  }
};

// POST /api/conversations — create (or reuse) a 1-to-1 conversation = send a message request
const createConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    if (!participantId || !mongoose.isValidObjectId(participantId)) {
      throw new ChatError(400, "Valid participantId is required");
    }
    if (String(participantId) === String(req.user.id)) {
      throw new ChatError(400, "You can't start a conversation with yourself");
    }

    const otherUser = await User.findById(participantId).select(POPULATE_USER_FIELDS);
    if (!otherUser) throw new ChatError(404, "User not found");

    // Only 1-to-1 chats: a group that happens to contain both users must not be reused
    const selfId = new mongoose.Types.ObjectId(req.user.id);
    const otherId = new mongoose.Types.ObjectId(participantId);
    let conversation = await Conversation.findOne({
      isGroup: { $ne: true },
      participants: { $all: [selfId, otherId], $size: 2 },
    });
    if (!conversation) {
      conversation = await Conversation.findOne({
        isGroup: { $ne: true },
        participants: { $all: [selfId, otherId] },
      });
    }

    if (conversation) {
      // Existing contact (including after Clear Chat) — never open a new request
      return res.status(200).json({
        success: true,
        conversation: {
          id: idOf(conversation),
          participant: shapeUser(otherUser),
          requestStatus: conversation.requestStatus,
          requestedBy: conversation.requestedBy ? idOf(conversation.requestedBy) : null,
        },
        existing: true,
      });
    }

    // New conversation — starts as pending; receiver must accept before replying
    conversation = await Conversation.create({
      participants: [req.user.id, participantId],
      requestStatus: "pending",
      requestedBy: req.user.id,
    });

    // The other user sees the new request appear instantly in their Requests folder
    await emitConversationNew(conversation._id, [participantId]);

    res.status(201).json({
      success: true,
      conversation: {
        id: idOf(conversation),
        participant: shapeUser(otherUser),
        requestStatus: conversation.requestStatus,
        requestedBy: req.user.id,
      },
      existing: false,
    });
  } catch (error) {
    handleError(res, "createConversation", error);
  }
};

// PUT /api/conversations/:id/accept — the receiver accepts a pending request
const acceptConversation = async (req, res) => {
  try {
    const conversation = await getConversationForUser(req.params.id, req.user.id);

    if (conversation.requestedBy && idOf(conversation.requestedBy) === req.user.id) {
      throw new ChatError(
        400,
        "You cannot accept your own request. Waiting for the recipient to accept."
      );
    }

    conversation.requestStatus = "accepted";
    await conversation.save();

    emitToUsers(participantIdsOf(conversation), "conversation:updated", {
      conversationId: idOf(conversation),
      requestStatus: "accepted",
    });

    res.status(200).json({ success: true, message: "Request accepted" });
  } catch (error) {
    handleError(res, "acceptConversation", error);
  }
};

// DELETE /api/conversations/:id — delete a conversation and its messages
const deleteConversation = async (req, res) => {
  try {
    const conversation = await getConversationForUser(req.params.id, req.user.id);
    const others = othersOf(conversation, req.user.id);

    await Message.deleteMany({ conversationId: conversation._id });
    await Conversation.findByIdAndDelete(conversation._id);

    emitToUsers(others, "conversation:deleted", { conversationId: idOf(conversation) });

    res.status(200).json({ success: true, message: "Conversation deleted" });
  } catch (error) {
    handleError(res, "deleteConversation", error);
  }
};

// PUT /api/conversations/:id/clear — hide messages for this user, keep the saved contact
const clearMessages = async (req, res) => {
  try {
    const conversation = await getConversationForUser(req.params.id, req.user.id);
    const viewer = String(req.user.id);

    // Keep the conversation document. Hide history only for the user who cleared.
    if (!conversation.clearedAt) conversation.clearedAt = new Map();
    conversation.clearedAt.set(viewer, new Date());

    // Clearing a thread means this person is a saved contact — next send is a message, not a request
    const becameAccepted = conversation.requestStatus !== "accepted";
    if (becameAccepted) {
      conversation.requestStatus = "accepted";
    }

    await conversation.save();

    // Only emit to the user who cleared — the other side's chat stays intact
    emitToUsers([req.user.id], "conversation:cleared", {
      conversationId: idOf(conversation),
    });

    if (becameAccepted) {
      emitToUsers(participantIdsOf(conversation), "conversation:updated", {
        conversationId: idOf(conversation),
        requestStatus: "accepted",
      });
    }

    res.status(200).json({ success: true, message: "Chat messages cleared" });
  } catch (error) {
    handleError(res, "clearMessages", error);
  }
};

// PUT /api/conversations/:id/block — toggle block for the logged-in user
const toggleBlockConversation = async (req, res) => {
  try {
    const conversation = await getConversationForUser(req.params.id, req.user.id);

    conversation.blockedBy = conversation.blockedBy || [];
    const isAlreadyBlocked = conversation.blockedBy.some((b) => idOf(b) === req.user.id);

    if (isAlreadyBlocked) {
      conversation.blockedBy = conversation.blockedBy.filter((b) => idOf(b) !== req.user.id);
    } else {
      conversation.blockedBy.push(req.user.id);
    }
    await conversation.save();

    res.status(200).json({
      success: true,
      isBlocked: !isAlreadyBlocked,
      message: !isAlreadyBlocked ? "User blocked" : "User unblocked",
    });
  } catch (error) {
    handleError(res, "toggleBlockConversation", error);
  }
};

// GET /api/conversations/:id/messages — all messages of a conversation
const getMessages = async (req, res) => {
  try {
    const conversation = await getConversationForUser(req.params.id, req.user.id);

    const clearedAtMs = clearedAtMsFor(conversation, req.user.id);
    const query = {
      conversationId: conversation._id,
      deletedFor: { $ne: req.user.id },
    };
    if (clearedAtMs) query.createdAt = { $gt: new Date(clearedAtMs) };

    const messages = await Message.find(query).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages: messages.map(shapeMessage) });
  } catch (error) {
    handleError(res, "getMessages", error);
  }
};

// POST /api/conversations/:id/messages — REST fallback; the app normally sends through the socket
const sendMessage = async (req, res) => {
  try {
    const message = await sendChatMessage({
      conversationId: req.params.id,
      senderId: req.user.id,
      text: req.body.text,
    });
    res.status(201).json({ success: true, message });
  } catch (error) {
    handleError(res, "sendMessage", error);
  }
};

// DELETE /api/conversations/:id/messages/:messageId — delete for everyone (sender only)
const deleteMessage = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.messageId)) {
      throw new ChatError(400, "Invalid ID");
    }
    const conversation = await getConversationForUser(req.params.id, req.user.id);

    const message = await Message.findOne({
      _id: req.params.messageId,
      conversationId: conversation._id,
    });
    if (!message) throw new ChatError(404, "Message not found");
    if (idOf(message.sender) !== req.user.id) throw new ChatError(403, "Forbidden");

    await Message.findByIdAndDelete(message._id);
    await Conversation.findByIdAndUpdate(conversation._id, { $pull: { messages: message._id } });

    emitToUsers(othersOf(conversation, req.user.id), "message:deleted", {
      conversationId: idOf(conversation),
      messageId: idOf(message),
    });

    res.status(200).json({ success: true, message: "Message deleted" });
  } catch (error) {
    handleError(res, "deleteMessage", error);
  }
};

// PUT /api/conversations/:id/messages/:messageId/delete-for-me
const deleteMessageForMe = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.messageId)) {
      throw new ChatError(400, "Invalid ID");
    }
    const conversation = await getConversationForUser(req.params.id, req.user.id);

    const message = await Message.findOne({
      _id: req.params.messageId,
      conversationId: conversation._id,
    });
    if (!message) throw new ChatError(404, "Message not found");

    message.deletedFor = message.deletedFor || [];
    if (!message.deletedFor.some((u) => idOf(u) === req.user.id)) {
      message.deletedFor.push(req.user.id);
      await message.save();
    }

    res.status(200).json({ success: true, message: "Message deleted for you" });
  } catch (error) {
    handleError(res, "deleteMessageForMe", error);
  }
};

// POST /api/conversations/group — create a group chat
const createGroupConversation = async (req, res) => {
  try {
    const { name, participantIds } = req.body;
    if (!Array.isArray(participantIds) || participantIds.length < 1) {
      throw new ChatError(400, "At least one other participant is required");
    }

    const validIds = participantIds.filter((id) => mongoose.isValidObjectId(id));
    const allParticipants = Array.from(new Set([req.user.id, ...validIds.map(String)]));

    const group = await Conversation.create({
      participants: allParticipants,
      requestStatus: "accepted",
      isGroup: true,
      groupName: (name && name.trim()) || "Group Chat",
      requestedBy: req.user.id,
      lastMessage: "Group created",
      lastMessageTime: Date.now(),
    });

    const populated = await Conversation.findById(group._id)
      .populate("participants", POPULATE_USER_FIELDS)
      .populate("messages");

    await emitConversationNew(
      group._id,
      allParticipants.filter((id) => id !== req.user.id)
    );

    res.status(201).json({
      success: true,
      conversation: shapeConversation(populated, req.user.id),
    });
  } catch (error) {
    handleError(res, "createGroupConversation", error);
  }
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