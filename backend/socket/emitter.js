// Lets any part of the backend (REST controllers, services) push socket events
// without importing the socket server itself.

let io = null;

const userRoom = (userId) => `user:${userId}`;

const setIO = (instance) => {
  io = instance;
};

const getIO = () => io;

/** Emit an event to every connected socket of the given users. No-op if sockets aren't initialised. */
const emitToUsers = (userIds, event, payload) => {
  if (!io) return;
  const rooms = [...new Set((userIds || []).map(String))].map(userRoom);
  if (rooms.length) io.to(rooms).emit(event, payload);
};

module.exports = { setIO, getIO, userRoom, emitToUsers };
