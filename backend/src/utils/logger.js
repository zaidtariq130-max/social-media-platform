/** Tiny logger so we can swap in pino/winston later without touching callers. */
const env = require("../config/env");

const sinks = { info: console.log, warn: console.warn, error: console.error };

const write = (level, args) => {
  if (env.isTest) return;
  sinks[level](`[${new Date().toISOString()}] ${level.toUpperCase()}`, ...args);
};

module.exports = {
  info: (...args) => write("info", args),
  warn: (...args) => write("warn", args),
  error: (...args) => write("error", args),
};
