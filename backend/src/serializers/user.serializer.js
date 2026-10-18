// Converts User documents into the JSON the frontend expects.
const { AVATAR_API } = require("../config/constants");
const { idOf } = require("../utils/id");

const avatarUrl = (style, seed) => `${AVATAR_API}/${style}/svg?seed=${encodeURIComponent(seed)}`;

/** The logged-in user, as returned by auth endpoints. */
const serializeAuthUser = (user) => ({
  id: idOf(user),
  username: user.username,
  email: user.email,
});

/** Another user as shown in chat lists. */
const serializeUser = (user) => ({
  id: idOf(user),
  username: user.username,
  name: user.username,
  avatar: avatarUrl("initials", user.username),
  bio: user.email,
  isOnline: false, // real presence is merged on the client from socket events
});

module.exports = { avatarUrl, serializeAuthUser, serializeUser };
