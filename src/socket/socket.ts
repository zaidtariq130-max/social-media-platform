import { io, type Socket } from "socket.io-client"
import { SOCKET_URL } from "../config/app"
import { bootstrapAuth, getAccessToken } from "../api/axios"

let socket: Socket | null = null
let authRetries = 0
const MAX_AUTH_RETRIES = 2

/** Single shared Socket.io connection for the whole app. */
export function getSocket(): Socket {
  if (socket) return socket

  const instance = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    // evaluated on every (re)connect, so a refreshed access token is picked up
    auth: (cb: (data: object) => void) => cb({ token: getAccessToken() }),
  })

  instance.on("connect", () => {
    authRetries = 0
  })

  // The server rejects missing / expired tokens: refresh the token once, then try again.
  instance.on("connect_error", async (err) => {
    if (!err.message.startsWith("Authentication error")) return // network errors auto-retry
    if (authRetries >= MAX_AUTH_RETRIES) return
    authRetries += 1
    if (await bootstrapAuth()) instance.connect()
  })

  socket = instance
  return instance
}

export function connectSocket(): Socket {
  const s = getSocket()
  if (!s.connected && !s.active) s.connect()
  return s
}

export function disconnectSocket(): void {
  socket?.disconnect()
}
