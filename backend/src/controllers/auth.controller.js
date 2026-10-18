const env = require("../config/env");
const { AUTH, DAY_MS } = require("../config/constants");
const authService = require("../services/auth.service");
const { sendSuccess } = require("../utils/response");

const cookieBase = {
  httpOnly: true,
  secure: env.isProd || env.cookie.sameSite === "none",
  sameSite: env.cookie.sameSite,
  path: AUTH.REFRESH_COOKIE_PATH,
};

const setRefreshCookie = (res, token) =>
  res.cookie(AUTH.REFRESH_COOKIE_NAME, token, {
    ...cookieBase,
    maxAge: env.jwt.refreshExpiresInDays * DAY_MS,
  });

const clearRefreshCookie = (res) => res.clearCookie(AUTH.REFRESH_COOKIE_NAME, cookieBase);

/** Sets the refresh cookie and sends { message, token, user }. */
const respondWithSession = (res, status, message, { user, accessToken, refreshToken }) => {
  setRefreshCookie(res, refreshToken);
  return sendSuccess(res, { message, token: accessToken, user }, status);
};

const signup = async (req, res) =>
  respondWithSession(res, 201, "User registered successfully", await authService.signup(req.body));

const login = async (req, res) =>
  respondWithSession(res, 200, "Login successful", await authService.login(req.body));

const refresh = async (req, res) => {
  try {
    const session = await authService.refresh(req.cookies?.[AUTH.REFRESH_COOKIE_NAME]);
    return respondWithSession(res, 200, "Token refreshed", session);
  } catch (error) {
    clearRefreshCookie(res);
    throw error;
  }
};

const logout = async (req, res) => {
  await authService.logout(req.cookies?.[AUTH.REFRESH_COOKIE_NAME]);
  clearRefreshCookie(res);
  return sendSuccess(res, { message: "Logged out successfully" });
};

const profile = async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  return sendSuccess(res, { message: "Profile fetched successfully", user });
};

module.exports = { signup, login, refresh, logout, profile };
