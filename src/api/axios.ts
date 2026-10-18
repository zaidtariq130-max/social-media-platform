
import axios from "axios"
import { API_BASE_URL } from "../config/app"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,
})


const AUTH_ENDPOINTS = ["/auth/login", "/auth/signup", "/auth/refresh"]

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export function clearAccessToken() {
  accessToken = null
}


api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)


let isRefreshing = false
let pendingQueue: {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}[] = []

function processQueue(error: unknown, token: string | null = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  pendingQueue = []
}

function redirectToLogin() {
  clearAccessToken()

  const currentPath = window.location.pathname
  if (currentPath !== "/login" && currentPath !== "/signup") {
    window.location.href = "/login"
  }
}

api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // A 401 from login/signup/refresh means "wrong credentials", not "token expired":
    // don't try to refresh, just hand the error to the form so it can show it.
    const isAuthRequest = AUTH_ENDPOINTS.some((path) => originalRequest?.url?.startsWith(path))

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthRequest) {
      if (error.response?.status === 401 && !isAuthRequest) {
        redirectToLogin()
      }
      return Promise.reject(error)
    }

    if (isRefreshing) {

      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          },
          reject,
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await refreshClient.post("/auth/refresh")
      const newToken = data.token

      setAccessToken(newToken)
      originalRequest.headers.Authorization = `Bearer ${newToken}`

      processQueue(null, newToken)

      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)


export async function bootstrapAuth(): Promise<boolean> {
  try {
    const { data } = await refreshClient.post("/auth/refresh")
    setAccessToken(data.token)
    return true
  } catch {
    clearAccessToken()
    return false
  }
}

export default api
