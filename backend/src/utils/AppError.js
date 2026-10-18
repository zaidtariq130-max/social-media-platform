/**
 * Error with an HTTP-like status. Shared by REST controllers, services and socket handlers.
 * `detail` is an optional longer explanation, `errors` a list of field problems.
 */
class AppError extends Error {
  constructor(status, message, { detail, errors } = {}) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.detail = detail;
    this.errors = errors;
  }
}

module.exports = AppError;
