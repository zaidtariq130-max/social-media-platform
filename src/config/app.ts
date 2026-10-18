export const APP_NAME = "SocialApp"

/**
 * Backend origin. Set VITE_API_URL in .env (see .env.example); the fallback is for local dev.
 * REST lives under /api, Socket.io on the root.
 */
export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:5000"

export const API_BASE_URL = `${API_URL}/api`
export const SOCKET_URL = API_URL
