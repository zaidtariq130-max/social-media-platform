const rateLimit = require("express-rate-limit");
const env = require("../config/env");

const build = (max, message) =>
  rateLimit({
    windowMs: env.rateLimit.windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

/** Strict: only for login / signup (brute-force protection). */
const authLimiter = build(env.rateLimit.authMax, "Too many attempts. Please try again later.");

/** Token refresh happens on every page load / tab, so it gets a bigger budget than login. */
const refreshLimiter = build(env.rateLimit.refreshMax, "Too many refresh attempts. Please try again later.");

/** Loose: safety net for the whole API. */
const apiLimiter = build(env.rateLimit.apiMax, "Too many requests. Please slow down.");

module.exports = { authLimiter, refreshLimiter, apiLimiter };
