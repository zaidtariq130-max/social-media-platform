const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    requestStatus: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isGroup: { type: Boolean, default: false },
    groupName: { type: String, default: "" },
    lastMessage: { type: String, default: "" },
    lastMessageTime: { type: Date, default: Date.now },
    // Per-user "clear chat": hide messages older than this timestamp for that user only
    clearedAt: { type: Map, of: Date, default: undefined },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
