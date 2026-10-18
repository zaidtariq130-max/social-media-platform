const User = require("../models/User");
const AppError = require("../utils/AppError");
const { USER_HIDDEN_FIELDS } = require("../config/constants");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Everyone except the current user, optionally filtered by username (`q`). */
const listUsers = async (currentUserId, { q, page, limit }) => {
  const filter = { _id: { $ne: currentUserId } };
  if (q) filter.username = { $regex: escapeRegex(q), $options: "i" };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(USER_HIDDEN_FIELDS)
      .sort({ username: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, pagination: { page, limit, total, hasMore: page * limit < total } };
};

/** Exact (case-insensitive) username match, used by "add by @username". */
const findByUsername = async (currentUserId, username) => {
  const user = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .select(USER_HIDDEN_FIELDS);

  if (!user) throw new AppError(404, "No user found with that username");
  if (String(user._id) === String(currentUserId)) {
    throw new AppError(400, "That's you! You can't start a conversation with yourself");
  }
  return user;
};

module.exports = { listUsers, findByUsername };
