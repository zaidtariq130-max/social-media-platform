const AppError = require("../utils/AppError");
const { verifyAccessToken } = require("../utils/tokens");

/** Requires `Authorization: Bearer <accessToken>` and sets `req.user = { id }`. */
const authenticate = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new AppError(401, "Access denied. No token provided"));
  }

  try {
    const { id } = verifyAccessToken(token);
    req.user = { id };
    return next();
  } catch {
    return next(new AppError(401, "Invalid or expired token"));
  }
};

module.exports = authenticate;
