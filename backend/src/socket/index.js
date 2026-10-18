const { Server } = require("socket.io");
const env = require("../config/env");
const { SOCKET_EVENTS } = require("../config/constants");
const { verifyAccessToken } = require("../utils/tokens");
const { setIO, userRoom } = require("./emitter");
const presence = require("./presence");
const registerChatHandlers = require("./chatHandlers");

/** Attaches Socket.io to the HTTP server. Clients authenticate with their access token. */
function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });
  setIO(io);

  // Handshake auth: io(url, { auth: { token } })
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error: no token"));
    try {
      socket.user = verifyAccessToken(token);
      return next();
    } catch {
      return next(new Error("Authentication error: invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = String(socket.user.id);

    // every socket of a user joins the same private room -> multi-tab / multi-device works
    socket.join(userRoom(userId));

    if (presence.add(userId)) {
      io.emit(SOCKET_EVENTS.PRESENCE_UPDATE, { userId, isOnline: true });
    }

    // the client asks for the current online list once its listeners are ready
    socket.on(SOCKET_EVENTS.PRESENCE_REQUEST, () => {
      socket.emit(SOCKET_EVENTS.PRESENCE_LIST, { userIds: presence.list() });
    });

    registerChatHandlers(socket);

    socket.on("disconnect", () => {
      if (presence.remove(userId)) {
        io.emit(SOCKET_EVENTS.PRESENCE_UPDATE, { userId, isOnline: false });
      }
    });
  });

  return io;
}

module.exports = initSocket;
