const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const { createLimiter } = require("../utils/rateLimiter");
const { SOCKET_EVENTS, SOCKET_LIMITS } = require("../config/constants");
const { getConversationForUser, othersOf } = require("../services/conversation.service");
const { sendMessage, markConversationRead } = require("../services/message.service");
const { emitToUsers } = require("./emitter");

const errorMessage = (err) => (err instanceof AppError ? err.message : "Something went wrong");

/**
 * Wraps an event handler: always has a safe ack callback and never lets an
 * exception crash the server.
 */
const safe = (name, handler) => async (payload, ack) => {
  const reply = typeof ack === "function" ? ack : () => {};
  try {
    reply({ ok: true, ...(await handler(payload || {})) });
  } catch (err) {
    if (!(err instanceof AppError)) logger.error(`socket ${name} error:`, err);
    reply({ ok: false, error: errorMessage(err) });
  }
};

const limiterOptions = (max) => ({ max, windowMs: SOCKET_LIMITS.WINDOW_MS });

/** Registers the chat events for one connected socket. `socket.user.id` is set by the auth middleware. */
module.exports = function registerChatHandlers(socket) {
  const userId = String(socket.user.id);

  // each socket gets its own budget, so one noisy client can't flood the server
  const canSendMessage = createLimiter(limiterOptions(SOCKET_LIMITS.MESSAGES_PER_WINDOW));
  const canType = createLimiter(limiterOptions(SOCKET_LIMITS.TYPING_PER_WINDOW));

  // client -> server: { conversationId, text }   ack -> { ok, message | error }
  socket.on(
    SOCKET_EVENTS.MESSAGE_SEND,
    safe(SOCKET_EVENTS.MESSAGE_SEND, async ({ conversationId, text }) => {
      if (!canSendMessage()) throw new AppError(429, "You are sending messages too fast");
      const message = await sendMessage({
        conversationId,
        senderId: userId,
        text,
        senderSocket: socket,
      });
      return { message };
    })
  );

  // client -> server: { conversationId, isTyping }   (relayed to the other members)
  socket.on(
    SOCKET_EVENTS.TYPING,
    safe(SOCKET_EVENTS.TYPING, async ({ conversationId, isTyping }) => {
      if (!canType()) return {};
      const conversation = await getConversationForUser(conversationId, userId);
      emitToUsers(othersOf(conversation, userId), SOCKET_EVENTS.TYPING, {
        conversationId: String(conversationId),
        userId,
        isTyping: Boolean(isTyping),
      });
      return {};
    })
  );

  // client -> server: { conversationId }   (the user opened / is looking at the chat)
  socket.on(
    SOCKET_EVENTS.CONVERSATION_READ,
    safe(SOCKET_EVENTS.CONVERSATION_READ, async ({ conversationId }) => {
      await markConversationRead({ conversationId, userId, userSocket: socket });
      return {};
    })
  );
};
