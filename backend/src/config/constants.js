/** App-wide constants. Change a number here and it changes everywhere. */

const DAY_MS = 24 * 60 * 60 * 1000;

module.exports = Object.freeze({
  DAY_MS,

  LIMITS: Object.freeze({
    USERNAME_MIN: 3,
    USERNAME_MAX: 30,
    PASSWORD_MIN: 8,
    PASSWORD_MAX: 72, // bcrypt ignores everything after 72 bytes
    POST_MAX: 5000,
    MESSAGE_MAX: 2000,
    GROUP_NAME_MAX: 60,
    GROUP_MEMBERS_MAX: 50,
  }),

  PAGINATION: Object.freeze({
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 100,
  }),

  AUTH: Object.freeze({
    BCRYPT_ROUNDS: 10,
    REFRESH_COOKIE_NAME: "refreshToken",
    REFRESH_COOKIE_PATH: "/api/auth",
    MAX_SESSIONS_PER_USER: 5, // devices logged in at the same time
    // A rotated refresh token is still accepted for a few seconds so two
    // parallel refresh calls (React StrictMode, two tabs) don't log the user out.
    REFRESH_REUSE_GRACE_MS: 10 * 1000,
  }),

  CHAT: Object.freeze({
    // messages sent to the client per conversation in GET /conversations
    PRELOAD_MESSAGES: 200,
    DEFAULT_PAGE_SIZE: 50,
  }),

  SOCKET_LIMITS: Object.freeze({
    MESSAGES_PER_WINDOW: 20,
    TYPING_PER_WINDOW: 30,
    WINDOW_MS: 10 * 1000,
  }),

  // friend requests between users; only accepted friends can chat
  FRIEND_STATUS: Object.freeze({ PENDING: "pending", ACCEPTED: "accepted", DECLINED: "declined" }),
  // how the logged-in user relates to another user, as shown in the UI
  RELATIONSHIP: Object.freeze({
    NONE: "none",
    FRIENDS: "friends",
    REQUEST_SENT: "request_sent",
    REQUEST_RECEIVED: "request_received",
  }),
  MESSAGE_STATUS: Object.freeze({ SENT: "sent", DELIVERED: "delivered", READ: "read" }),
  FOLDER: Object.freeze({ PRIMARY: "primary", BLOCKED: "blocked" }),

  // never send these fields to a client
  USER_HIDDEN_FIELDS: "-password -refreshSessions",

  AVATAR_API: "https://api.dicebear.com/7.x",

  SOCKET_EVENTS: Object.freeze({
    // server -> client
    MESSAGE_NEW: "message:new",
    MESSAGE_DELETED: "message:deleted",
    MESSAGES_READ: "messages:read",
    CONVERSATION_NEW: "conversation:new",
    CONVERSATION_DELETED: "conversation:deleted",
    CONVERSATION_CLEARED: "conversation:cleared",
    PRESENCE_UPDATE: "presence:update",
    PRESENCE_LIST: "presence:list",
    FRIEND_REQUEST_NEW: "friend:request",
    FRIEND_REQUEST_UPDATED: "friend:updated",
    // client -> server (and relayed)
    MESSAGE_SEND: "message:send",
    TYPING: "typing",
    CONVERSATION_READ: "conversation:read",
    PRESENCE_REQUEST: "presence:request",
  }),
});
