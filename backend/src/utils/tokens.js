const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

const signAccessToken = (userId) =>
  jwt.sign({ id: String(userId) }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });

// jwtid makes every refresh token unique, even if two are issued in the same second
const signRefreshToken = (userId) =>
  jwt.sign({ id: String(userId) }, env.jwt.refreshSecret, {
    expiresIn: `${env.jwt.refreshExpiresInDays}d`,
    jwtid: crypto.randomUUID(),
  });

const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);
const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

/**
 * Refresh tokens are stored as SHA-256 hashes.
 * (bcrypt is the wrong tool here: it only looks at the first 72 bytes, and a JWT's
 * first 72 bytes are nearly identical for every token of the same user.)
 */
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
