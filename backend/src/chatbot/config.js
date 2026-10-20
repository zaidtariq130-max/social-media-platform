/**
 * Chatbot-only constants. Kept here (not in config/constants.js) so the chatbot
 * feature stays in one place and the rest of the app is untouched.
 */
module.exports = Object.freeze({
  // Keep in sync with APP_NAME in the frontend (src/config/app.ts)
  APP_NAME: "SocialApp",
  BOT_NAME: "SocialApp Assistant",

  LIMITS: Object.freeze({
    MESSAGE_MAX: 500, // one user question; this is a help chat, not an essay box
    HISTORY_MAX_ITEMS: 10, // last 5 question/answer pairs are enough context
    HISTORY_ITEM_MAX: 1000, // express.json() already caps the whole body at 10kb
  }),

  // Gemini 3 models can loop / degrade below the default temperature of 1.0, so we do NOT set it.
  // Consistency comes from the system prompt + examples instead (see systemPrompt.js).
  MAX_OUTPUT_TOKENS: 1024,

  RATE_LIMIT_WINDOW_MS: 60 * 1000,

  // Gemini sometimes answers 503 "high demand" for a few seconds. These errors are temporary, so we
  // retry before giving up, and then fall back to GEMINI_FALLBACK_MODEL (see chatbot.service.js).
  RETRY: Object.freeze({
    STATUSES: Object.freeze([429, 500, 503, 504]), // only these are worth retrying
    ATTEMPTS_PER_MODEL: 3,
    BASE_DELAY_MS: 700, // waits ~0.7s, then ~1.4s (plus a little random jitter)
    JITTER_MS: 300,
  }),

  // Shown instead of a model answer when Gemini blocks/returns nothing
  FALLBACKS: Object.freeze({
    EMPTY:
      "Sorry, I couldn't come up with a reply to that. Could you rephrase your question about SocialApp?",
    BLOCKED:
      "I can't help with that request here. If you are in danger or need urgent help, please contact your local emergency services or someone you trust. Otherwise, I can help with using SocialApp, such as posts, messages, your account and chat settings.",
    UNAVAILABLE: "The assistant is having trouble right now. Please try again in a moment.",
  }),
});
