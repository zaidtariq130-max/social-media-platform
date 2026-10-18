/** The logged-in user's basic info, cached in localStorage so pages can render before the API answers. */
const KEY = "current_user"

export interface StoredUser {
  id?: string
  username?: string
  email?: string
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as StoredUser) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: StoredUser): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(user))
  } catch {
    // storage can be blocked (private mode); the app still works without it
  }
}

export function clearStoredUser(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
