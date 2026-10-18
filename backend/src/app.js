const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const env = require("./config/env");
const routes = require("./routes");
const { apiLimiter } = require("./middleware/rateLimiters");
const { notFound, errorHandler } = require("./middleware/error.middleware");

/** Builds the Express app. No DB or port here, so it is easy to test. */
const createApp = () => {
  const app = express();

  if (env.trustProxy) app.set("trust proxy", env.trustProxy);

  app.use(helmet());
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json({ limit: "10kb" }));
  app.use(cookieParser());
  if (!env.isTest) app.use(morgan(env.isProd ? "combined" : "dev"));

  app.get("/", (req, res) => res.send("Backend is running"));
  app.get("/health", (req, res) =>
    res.json({
      status: "ok",
      uptime: process.uptime(),
      db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    })
  );

  app.use("/api", apiLimiter, routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
