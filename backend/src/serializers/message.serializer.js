const { MESSAGE_STATUS } = require("../config/constants");
const { idOf } = require("../utils/id");

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const serializeMessage = (msg) => ({
  id: idOf(msg),
  senderId: idOf(msg.sender),
  text: msg.text || "",
  timestamp: msg.createdAt ? formatTime(msg.createdAt) : "",
  createdAt: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now(),
  status: msg.status || MESSAGE_STATUS.DELIVERED,
  reactions: msg.reactions || [],
});

module.exports = { serializeMessage };
