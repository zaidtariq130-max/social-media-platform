const mongoose = require("mongoose");
const { FRIEND_STATUS } = require("../config/constants");

/**
 * One document per pair of users. It starts as a pending request and becomes
 * "accepted" (they are friends) or "declined". Deleting it means "no relationship".
 */
const friendshipSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: Object.values(FRIEND_STATUS),
      default: FRIEND_STATUS.PENDING,
    },
    // "<smallerUserId>:<biggerUserId>" (see directKeyOf). The unique index makes it
    // impossible to have two requests for the same pair, whoever sent them.
    pairKey: { type: String, required: true },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

friendshipSchema.index({ pairKey: 1 }, { unique: true });
// "my incoming / outgoing requests" and "my friends"
friendshipSchema.index({ recipient: 1, status: 1, createdAt: -1 });
friendshipSchema.index({ requester: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Friendship", friendshipSchema);
