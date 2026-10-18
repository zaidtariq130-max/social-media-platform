import axios from "axios"

export interface ApiErrorInfo {
  /** false for network errors (server unreachable) */
  hasResponse: boolean
  /** `message` sent by the backend, if any */
  message?: string
  /** longer `detail` sent by the backend, if any */
  detail?: string
}

/** Safely reads the backend's { message, detail } out of an unknown caught error. */
export function parseApiError(error: unknown): ApiErrorInfo {
  if (!axios.isAxiosError(error)) return { hasResponse: false }
  const data = error.response?.data as { message?: unknown; detail?: unknown } | undefined
  return {
    hasResponse: Boolean(error.response),
    message: typeof data?.message === "string" && data.message ? data.message : undefined,
    detail: typeof data?.detail === "string" && data.detail ? data.detail : undefined,
  }
}

/** The backend's message if there is one, otherwise `fallback`. */
export function getErrorMessage(error: unknown, fallback: string): string {
  return parseApiError(error).message ?? fallback
}
