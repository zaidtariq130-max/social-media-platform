const mongoose = require("mongoose");
const { LIMITS } = require("../config/constants");

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: LIMITS.POST_MAX },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
