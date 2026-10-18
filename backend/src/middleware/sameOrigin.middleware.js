const env = require("../config/env");
const AppError = require("../utils/AppError");

const normalize = (url) => String(url).replace(/\/+$/, "").toLowerCase();

/**
 * CSRF guard for endpoints that are authenticated by the refresh *cookie*
 * (/auth/refresh, /auth/logout). Browsers always send an `Origin` header on
 * cross-site POSTs, so a request coming from any site other than CLIENT_URL is refused.
 * Requests without an Origin header (curl, server-to-server, same-origin GETs) pass.
 */
const requireAllowedOrigin = (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && normalize(origin) !== normalize(env.clientUrl)) {
    return next(new AppError(403, "Request origin not allowed"));
  }
  return next();
};

module.exports = requireAllowedOrigin;
