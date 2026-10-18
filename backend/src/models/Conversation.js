const mongoose = require("mongoose");
const { REQUEST_STATUS } = require("../config/constants");

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    requestStatus: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.PENDING,
    },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isGroup: { type: Boolean, default: false },
    // "<smallerUserId>:<biggerUserId>" for 1-to-1 chats only. The unique index below
    // makes it impossible to create two direct chats for the same pair of users.
    directKey: { type: String, default: undefined },
    groupName: { type: String, default: "" },
    lastMessage: { type: String, default: "" },
    lastMessageTime: { type: Date, default: Date.now },
    // Per-user "clear chat": hide messages older than this timestamp for that user only
    clearedAt: { type: Map, of: Date, default: undefined },
  },
  { timestamps: true }
);

// "all conversations of this user, newest first"
conversationSchema.index({ participants: 1, lastMessageTime: -1 });

conversationSchema.index(
  { directKey: 1 },
  { unique: true, partialFilterExpression: { directKey: { $type: "string" } } }
);

module.exports = mongoose.model("Conversation", conversationSchema);
