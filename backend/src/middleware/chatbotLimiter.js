const rateLimit = require("express-rate-limit");
const env = require("../config/env");
const { RATE_LIMIT_WINDOW_MS } = require("../chatbot/config");

/**
 * Every chatbot call costs money and quota, so it gets its own, stricter limit.
 * Counted per logged-in user (the route runs `authenticate` first), not per IP.
 */
const chatbotLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: env.gemini.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `user:${req.user.id}`,
  message: { success: false, message: "You're sending messages too fast. Please wait a moment." },
});

module.exports = { chatbotLimiter };
