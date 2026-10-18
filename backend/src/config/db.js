const mongoose = require("mongoose");
const env = require("./env");
const logger = require("../utils/logger");

const connectDB = async () => {
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
  mongoose.connection.on("reconnected", () => logger.info("MongoDB reconnected"));

  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 });
  logger.info("MongoDB connected");
};

const disconnectDB = () => mongoose.disconnect();

module.exports = { connectDB, disconnectDB };
