/**
 * Single source of truth for environment variables.
 * Nothing else in the codebase should read `process.env` directly.
 */
require("dotenv").config({ quiet: true });

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const REQUIRED = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];
const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}. ` +
      "Copy .env.example to .env and fill them in."
  );
}

const nodeEnv = process.env.NODE_ENV || "development";

module.exports = Object.freeze({
  nodeEnv,
  isProd: nodeEnv === "production",
  isTest: nodeEnv === "test",

  port: toInt(process.env.PORT, 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  // e.g. TRUST_PROXY=1 when running behind Nginx / Render / Railway
  trustProxy: process.env.TRUST_PROXY ? toInt(process.env.TRUST_PROXY, 1) : null,

  mongoUri: process.env.MONGO_URI,

  jwt: {
    accessSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    refreshExpiresInDays: toInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS, 7),
  },

  cookie: {
    // use "none" (together with HTTPS) if the frontend lives on a different site
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
  },

  // Chatbot (Google Gemini). Optional: without GEMINI_API_KEY the rest of the app works
  // normally and only POST /api/chatbot answers 503.
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
    // Used only when the main model keeps failing with temporary errors (503 high demand).
    // Set GEMINI_FALLBACK_MODEL= (empty) to turn the fallback off.
    fallbackModel: (process.env.GEMINI_FALLBACK_MODEL ?? "gemini-3.1-flash-lite").trim(),
    // minimal | low | medium | high. Empty = let the model decide. "low" keeps support answers fast.
    thinkingLevel: (process.env.GEMINI_THINKING_LEVEL ?? "low").trim().toLowerCase(),
    timeoutMs: toInt(process.env.GEMINI_TIMEOUT_MS, 20 * 1000),
    // chatbot requests per user per minute
    rateLimitMax: toInt(process.env.RATE_LIMIT_CHATBOT_MAX, 15),
  },

  rateLimit: {
    windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    authMax: toInt(process.env.RATE_LIMIT_AUTH_MAX, 20),
    refreshMax: toInt(process.env.RATE_LIMIT_REFRESH_MAX, 100),
    apiMax: toInt(process.env.RATE_LIMIT_API_MAX, 1000),
  },
});
