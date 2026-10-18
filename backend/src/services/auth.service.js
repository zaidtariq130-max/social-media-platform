const bcrypt = require("bcryptjs");
const User = require("../models/User");
const env = require("../config/env");
const { AUTH, DAY_MS } = require("../config/constants");
const AppError = require("../utils/AppError");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require("../utils/tokens");
const { serializeAuthUser } = require("../serializers/user.serializer");

const REFRESH_TTL_MS = env.jwt.refreshExpiresInDays * DAY_MS;
// Rotated tokens linger for a few seconds (grace window), so allow some extra entries.
const MAX_STORED_SESSIONS = AUTH.MAX_SESSIONS_PER_USER * 2;

// Compared against when the email is unknown, so "no such user" and "wrong password"
// take the same time and can't be told apart.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", AUTH.BCRYPT_ROUNDS);

const invalidCredentials = () =>
  new AppError(401, "Login failed", { detail: "Invalid email or password." });

const invalidRefresh = (message = "Invalid or expired refresh token") => new AppError(401, message);

/** Removes sessions that expired or were rotated more than the grace period ago. */
const pruneSessions = async (userId) => {
  const now = Date.now();
  await User.updateOne(
    { _id: userId },
    { $pull: { refreshSessions: { expiresAt: { $lt: new Date(now) } } } }
  );
  await User.updateOne(
    { _id: userId },
    {
      $pull: {
        refreshSessions: { replacedAt: { $lt: new Date(now - AUTH.REFRESH_REUSE_GRACE_MS) } },
      },
    }
  );
};

/** Issues an access + refresh token pair and remembers the refresh token (one entry per device). */
const startSession = async (userId) => {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);

  await pruneSessions(userId);
  await User.updateOne(
    { _id: userId },
    {
      $push: {
        refreshSessions: {
          $each: [
            {
              tokenHash: hashToken(refreshToken),
              expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
            },
          ],
          $slice: -MAX_STORED_SESSIONS,
        },
      },
    }
  );

  return { accessToken, refreshToken };
};

const signup = async ({ username, email, password }) => {
  if (await User.exists({ email })) {
    throw new AppError(409, "Email already registered");
  }
  // usernames are compared case-insensitively ("Ali" == "ali")
  if (await User.exists({ username }).collation({ locale: "en", strength: 2 })) {
    throw new AppError(409, "Username already taken");
  }

  const user = await User.create({ username, email, password });
  const tokens = await startSession(user._id);

  return { user: serializeAuthUser(user), ...tokens };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  const isValid = user
    ? await user.comparePassword(password)
    : await bcrypt.compare(password, DUMMY_HASH).then(() => false);

  if (!isValid) throw invalidCredentials();

  const tokens = await startSession(user._id);
  return { user: serializeAuthUser(user), ...tokens };
};

/** Rotates the refresh token: the old one is retired, a new pair is returned. */
const refresh = async (refreshToken) => {
  if (!refreshToken) throw invalidRefresh("No refresh token provided");

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw invalidRefresh();
  }

  const tokenHash = hashToken(refreshToken);
  const user = await User.findOne({
    _id: decoded.id,
    "refreshSessions.tokenHash": tokenHash,
  }).select("+refreshSessions");

  if (!user) throw invalidRefresh("Refresh token not recognized");

  const session = user.refreshSessions.find((s) => s.tokenHash === tokenHash);
  const now = Date.now();

  if (session.expiresAt.getTime() < now) throw invalidRefresh();

  if (session.replacedAt) {
    // already rotated: fine inside the grace window, otherwise it's a reused (possibly stolen) token
    if (now - session.replacedAt.getTime() > AUTH.REFRESH_REUSE_GRACE_MS) {
      await User.updateOne({ _id: user._id }, { $set: { refreshSessions: [] } });
      throw invalidRefresh("Refresh token not recognized");
    }
  } else {
    await User.updateOne(
      { _id: user._id, "refreshSessions.tokenHash": tokenHash },
      { $set: { "refreshSessions.$.replacedAt": new Date(now) } }
    );
  }

  const tokens = await startSession(user._id);
  return { user: serializeAuthUser(user), ...tokens };
};

/** Logs out only the device that owns this refresh token. Never throws. */
const logout = async (refreshToken) => {
  if (!refreshToken) return;
  try {
    const { id } = verifyRefreshToken(refreshToken);
    await User.updateOne(
      { _id: id },
      { $pull: { refreshSessions: { tokenHash: hashToken(refreshToken) } } }
    );
  } catch {
    // token already invalid/expired, nothing to clean up
  }
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");
  return serializeAuthUser(user);
};

module.exports = { signup, login, refresh, logout, getProfile };
