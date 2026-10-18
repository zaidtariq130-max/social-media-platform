// In-memory presence: userId -> number of open sockets (a user can have several tabs).
// For multiple server instances, move this to Redis / the socket.io Redis adapter.

const counts = new Map();

/** @returns true when this is the user's first open socket (they just came online). */
const add = (userId) => {
  const next = (counts.get(userId) || 0) + 1;
  counts.set(userId, next);
  return next === 1;
};

/** @returns true when that was the user's last open socket (they just went offline). */
const remove = (userId) => {
  const next = (counts.get(userId) || 0) - 1;
  if (next <= 0) {
    counts.delete(userId);
    return true;
  }
  counts.set(userId, next);
  return false;
};

const isOnline = (userId) => counts.has(String(userId));
const list = () => [...counts.keys()];

module.exports = { add, remove, isOnline, list };
