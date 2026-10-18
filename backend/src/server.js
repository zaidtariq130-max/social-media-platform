const http = require("http");
const env = require("./config/env");
const { connectDB, disconnectDB } = require("./config/db");
const createApp = require("./app");
const initSocket = require("./socket");
const logger = require("./utils/logger");

async function start() {
  // don't accept traffic until the database is reachable
  await connectDB();

  // Socket.io needs the raw HTTP server (app.listen() alone never starts it)
  const server = http.createServer(createApp());
  initSocket(server);

  server.listen(env.port, () => {
    logger.info(`Server is running on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    // force-exit if connections refuse to close
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

process.on("unhandledRejection", (reason) => logger.error("Unhandled rejection:", reason));

start().catch((err) => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});
