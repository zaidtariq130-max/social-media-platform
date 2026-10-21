const friendService = require("../services/friend.service");
const { sendSuccess } = require("../utils/response");

// GET /api/friends/people — other users + my relationship to each
const getPeople = async (req, res) => {
  const { people, pagination } = await friendService.listPeople(req.user.id, req.validatedQuery);
  return sendSuccess(res, { people, pagination });
};

// GET /api/friends — my friends
const getFriends = async (req, res) => {
  const friends = await friendService.listFriends(req.user.id);
  return sendSuccess(res, { friends });
};

// GET /api/friends/requests?type=incoming|outgoing
const getRequests = async (req, res) => {
  const requests = await friendService.listRequests(req.user.id, req.validatedQuery.type);
  return sendSuccess(res, { requests });
};

// POST /api/friends/requests — send a request
const sendRequest = async (req, res) => {
  const request = await friendService.sendRequest(req.user.id, req.body.userId);
  return sendSuccess(res, { message: "Friend request sent", request }, 201);
};

// PUT /api/friends/requests/:id — receiver accepts or declines
const respondToRequest = async (req, res) => {
  const request = await friendService.respondToRequest(req.user.id, req.params.id, req.body.action);
  const message =
    req.body.action === "accept" ? "Friend request accepted" : "Friend request declined";
  return sendSuccess(res, { message, request });
};

// DELETE /api/friends/requests/:id — sender cancels a pending request
const cancelRequest = async (req, res) => {
  await friendService.cancelRequest(req.user.id, req.params.id);
  return sendSuccess(res, { message: "Friend request cancelled" });
};

// DELETE /api/friends/:id — unfriend (id = the other user's id)
const removeFriend = async (req, res) => {
  await friendService.removeFriend(req.user.id, req.params.id);
  return sendSuccess(res, { message: "Friend removed" });
};

module.exports = {
  getPeople,
  getFriends,
  getRequests,
  sendRequest,
  respondToRequest,
  cancelRequest,
  removeFriend,
};
