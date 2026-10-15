// Converts Mongoose documents into the JSON shape the frontend expects.

const idOf = (value) => (value && value._id ? value._id : value).toString();

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const initialsAvatar = (seed) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}`;

const identiconAvatar = (seed) =>
  `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}`;

const shapeUser = (user) => ({
  id: idOf(user),
  username: user.username,
  name: user.username,
  avatar: initialsAvatar(user.username),
  bio: user.email,
  isOnline: false, // real presence is merged on the client from socket events
});

/** Timestamp after which this viewer should see messages (0 = show all). */
const clearedAtMsFor = (conv, viewerId) => {
  if (!conv?.clearedAt) return 0;
  const key = String(viewerId);
  const raw =
    typeof conv.clearedAt.get === "function" ? conv.clearedAt.get(key) : conv.clearedAt[key];
  return raw ? new Date(raw).getTime() : 0;
};

const shapeMessage = (msg) => ({
  id: idOf(msg),
  senderId: idOf(msg.sender),
  text: msg.text || "",
  timestamp: msg.createdAt ? formatTime(msg.createdAt) : "",
  createdAt: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now(),
  status: msg.status || "delivered",
  reactions: msg.reactions || [],
});

/**
 * Shapes a conversation for one viewer.
 * `conv` must have `participants` populated (users) and `messages` populated (Message docs).
 */
const shapeConversation = (conv, viewerId) => {
  const viewer = String(viewerId);
  const participants = conv.participants || [];

  const isBlocked = (conv.blockedBy || []).some((b) => idOf(b) === viewer);
  const otherUser = participants.find((p) => idOf(p) !== viewer);

  let participant = null;
  if (conv.isGroup) {
    const name = conv.groupName || "Group Chat";
    participant = {
      id: idOf(conv),
      username: name,
      name,
      avatar: identiconAvatar(name),
      bio: `${participants.length} members`,
      isOnline: false,
    };
  } else if (otherUser) {
    participant = shapeUser(otherUser);
  }

  const clearedAtMs = clearedAtMsFor(conv, viewer);

  const visibleMessages = (conv.messages || []).filter((m) => {
    if ((m.deletedFor || []).some((d) => idOf(d) === viewer)) return false;
    if (clearedAtMs && new Date(m.createdAt).getTime() <= clearedAtMs) return false;
    return true;
  });

  const unreadCount = visibleMessages.filter(
    (m) => idOf(m.sender) !== viewer && m.status !== "read"
  ).length;

  const lastVisible = visibleMessages[visibleMessages.length - 1];

  const requestedBy = conv.requestedBy ? idOf(conv.requestedBy) : null;

  let folder = "requests";
  if (isBlocked) folder = "blocked";
  else if (conv.requestStatus === "accepted" || requestedBy === viewer) folder = "primary";

  return {
    id: idOf(conv),
    participant,
    // ids of everyone in the chat; lets the client work out presence for groups too
    memberIds: participants.map(idOf),
    isGroup: Boolean(conv.isGroup),
    groupName: conv.groupName || "",
    folder,
    requestStatus: conv.requestStatus,
    requestedBy,
    isBlocked,
    isMuted: false,
    unreadCount,
    lastMessage: lastVisible ? lastVisible.text || "" : "",
    lastMessageTime: lastVisible ? lastVisible.createdAt : conv.lastMessageTime,
    createdAt: conv.createdAt,
    messages: visibleMessages.map(shapeMessage),
  };
};

module.exports = { idOf, shapeUser, shapeMessage, shapeConversation, clearedAtMsFor };
