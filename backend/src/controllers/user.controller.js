const userService = require("../services/user.service");
const { serializeUser } = require("../serializers/user.serializer");
const { sendSuccess } = require("../utils/response");

// GET /api/users — everyone except the logged-in user
const getUsers = async (req, res) => {
  const { users, pagination } = await userService.listUsers(req.user.id, req.validatedQuery);
  return sendSuccess(res, { users, pagination });
};

// GET /api/users/by-username/:username — one user, found by exact username
const getUserByUsername = async (req, res) => {
  const user = await userService.findByUsername(req.user.id, req.params.username);
  return sendSuccess(res, { user: serializeUser(user) });
};

// GET /api/users/me/stats — posts / friends / pending requests of the logged-in user
const getMyStats = async (req, res) => {
  const stats = await userService.getMyStats(req.user.id);
  return sendSuccess(res, { stats });
};

module.exports = { getUsers, getUserByUsername, getMyStats };
