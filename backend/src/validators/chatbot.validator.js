const { z } = require("zod");
const { LIMITS } = require("../chatbot/config");

const historyItem = z.object({
  // the browser calls the bot "model" in Gemini terms; "assistant" is accepted too
  role: z.enum(["user", "model", "assistant"], "role must be user or model"),
  text: z
    .string("History text is required")
    .trim()
    .min(1, "History text is required")
    .max(
      LIMITS.HISTORY_ITEM_MAX,
      `History message is too long (max ${LIMITS.HISTORY_ITEM_MAX} characters)`
    ),
});

const chatBody = z.object({
  message: z
    .string("Message is required")
    .trim()
    .min(1, "Message is required")
    .max(LIMITS.MESSAGE_MAX, `Message is too long (max ${LIMITS.MESSAGE_MAX} characters)`),
  // earlier turns of THIS chat, oldest first. The server keeps no chat state.
  history: z
    .array(historyItem, "history must be a list")
    .max(LIMITS.HISTORY_MAX_ITEMS, `history can have at most ${LIMITS.HISTORY_MAX_ITEMS} messages`)
    .default([]),
});

module.exports = { chatBody };
