/**
 * Sliding-window limiter for one socket (or any key). Returns a function that
 * answers "may this action happen now?".
 */
const createLimiter = ({ max, windowMs }) => {
  let hits = [];
  return () => {
    const now = Date.now();
    hits = hits.filter((t) => now - t < windowMs);
    if (hits.length >= max) return false;
    hits.push(now);
    return true;
  };
};

module.exports = { createLimiter };
