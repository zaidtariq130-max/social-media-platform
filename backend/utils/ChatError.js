/** Error with an HTTP-like status, shared by REST controllers and socket handlers. */
class ChatError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ChatError";
    this.status = status;
  }
}

module.exports = ChatError;
