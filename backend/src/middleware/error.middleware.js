const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const notFound = (req, res, next) =>
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));

/** Turns any thrown error into the standard { success: false, message } response. */
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let status = 500;
  let body = { message: "Server error" };

  if (err instanceof AppError) {
    status = err.status;
    body = { message: err.message, detail: err.detail, errors: err.errors };
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    body = { message: "Invalid JSON body" };
  } else if (err.type === "entity.too.large") {
    status = 413;
    body = { message: "Request body too large" };
  } else if (err.name === "CastError") {
    status = 400;
    body = { message: "Invalid ID" };
  } else if (err.code === 11000) {
    status = 409;
    body = { message: "This value is already in use" };
  } else {
    logger.error(`${req.method} ${req.originalUrl}`, err);
  }

  return res.status(status).json({ success: false, ...body });
};

module.exports = { notFound, errorHandler };
