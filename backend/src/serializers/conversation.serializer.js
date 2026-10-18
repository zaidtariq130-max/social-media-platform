const { FOLDER, MESSAGE_STATUS, REQUEST_STATUS } = require("../config/constants");
const { idOf } = require("../utils/id");
const { avatarUrl, serializeUser } = require("./user.serializer");
const { serializeMessage } = require("./message.serializer");

/** Timestamp after which this viewer should see messages (0 = show all). */
const getClearedAtMs = (conv, viewerId) => {
  if (!conv?.clearedAt) return 0;
  const key = String(viewerId);
  const raw =
    typeof conv.clearedAt.get === "function" ? conv.clearedAt.get(key) : conv.clearedAt[key];
  return raw ? new Date(raw).getTime() : 0;
};

const serializeGroupParticipant = (conv, memberCount) => {
  const name = conv.groupName || "Group Chat";
  return {
    id: idOf(conv),
    username: name,
    name,
    avatar: avatarUrl("identicon", name),
    bio: `${memberCount} members`,
    isOnline: false,
  };
};

const folderFor = ({ isBlocked, conv, requestedBy, viewer }) => {
  if (isBlocked) return FOLDER.BLOCKED;
  if (conv.requestStatus === REQUEST_STATUS.ACCEPTED || requestedBy === viewer) {
    return FOLDER.PRIMARY;
  }
  return FOLDER.REQUESTS;
};

/**
 * Shapes a conversation for one viewer.
 * `conv` must have `participants` populated (users) and `messages` populated (Message docs).
 */
const serializeConversation = (conv, viewerId) => {
  const viewer = String(viewerId);
  const participants = conv.participants || [];

  const isBlocked = (conv.blockedBy || []).some((b) => idOf(b) === viewer);
  const otherUser = participants.find((p) => idOf(p) !== viewer);

  let participant = null;
  if (conv.isGroup) participant = serializeGroupParticipant(conv, participants.length);
  else if (otherUser) participant = serializeUser(otherUser);

  const clearedAtMs = getClearedAtMs(conv, viewer);

  const visibleMessages = (conv.messages || []).filter((m) => {
    if ((m.deletedFor || []).some((d) => idOf(d) === viewer)) return false;
    if (clearedAtMs && new Date(m.createdAt).getTime() <= clearedAtMs) return false;
    return true;
  });

  const unreadCount = visibleMessages.filter(
    (m) => idOf(m.sender) !== viewer && m.status !== MESSAGE_STATUS.READ
  ).length;

  const lastVisible = visibleMessages[visibleMessages.length - 1];
  const requestedBy = conv.requestedBy ? idOf(conv.requestedBy) : null;

  return {
    id: idOf(conv),
    participant,
    // ids of everyone in the chat; lets the client work out presence for groups too
    memberIds: participants.map(idOf),
    isGroup: Boolean(conv.isGroup),
    groupName: conv.groupName || "",
    folder: folderFor({ isBlocked, conv, requestedBy, viewer }),
    requestStatus: conv.requestStatus,
    requestedBy,
    isBlocked,
    isMuted: false,
    unreadCount,
    lastMessage: lastVisible ? lastVisible.text || "" : "",
    lastMessageTime: lastVisible ? lastVisible.createdAt : conv.lastMessageTime,
    createdAt: conv.createdAt,
    messages: visibleMessages.map(serializeMessage),
  };
};

module.exports = { serializeConversation, getClearedAtMs };
