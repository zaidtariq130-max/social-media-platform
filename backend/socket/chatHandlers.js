const ChatError = require("../utils/ChatError");
const {
  getConversationForUser,
  othersOf,
  sendChatMessage,
  markConversationRead,
} = require("../services/chatService");
const { emitToUsers } = require("./emitter");

const errorMessage = (err) =>
  err instanceof ChatError ? err.message : "Something went wrong";

/**
 * Wraps an event handler: always has a safe ack callback and never lets an
 * exception crash the server.
 */
const safe = (name, handler) => async (payload, ack) => {
  const reply = typeof ack === "function" ? ack : () => {};
  try {
    reply({ ok: true, ...(await handler(payload || {})) });
  } catch (err) {
    if (!(err instanceof ChatError)) console.error(`socket ${name} error:`, err);
    reply({ ok: false, error: errorMessage(err) });
  }
};

/** Registers the chat events for one connected socket. `socket.user.id` is set by the auth middleware. */
module.exports = function registerChatHandlers(socket) {
  const userId = String(socket.user.id);

  // client -> server: { conversationId, text }   ack -> { ok, message | error }
  socket.on(
    "message:send",
    safe("message:send", async ({ conversationId, text }) => {
      const message = await sendChatMessage({
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
    "typing",
    safe("typing", async ({ conversationId, isTyping }) => {
      const conversation = await getConversationForUser(conversationId, userId);
      emitToUsers(othersOf(conversation, userId), "typing", {
        conversationId: String(conversationId),
        userId,
        isTyping: Boolean(isTyping),
      });
      return {};
    })
  );

  // client -> server: { conversationId }   (the user opened / is looking at the chat)
  socket.on(
    "conversation:read",
    safe("conversation:read", async ({ conversationId }) => {
      await markConversationRead({ conversationId, userId, userSocket: socket });
      return {};
    })
  );
};
