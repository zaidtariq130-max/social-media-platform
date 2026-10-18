import api from "../api/axios"
import type { MessageUser } from "../types/messages"
import { avatarFor } from "../utils/avatar"

interface ApiUser {
  _id: string
  username: string
  email: string
}

/** GET /api/users, mapped to the shape the chat UI uses. */
export async function fetchUsers(): Promise<MessageUser[]> {
  const res = await api.get<{ users?: ApiUser[] }>("/users")
  return (res.data.users ?? []).map((u) => ({
    id: u._id,
    username: u.username,
    name: u.username,
    avatar: avatarFor(u.username),
    bio: u.email,
    isOnline: false,
  }))
}

interface SerializedUser {
  id: string
  username: string
  name?: string
  avatar?: string
  bio?: string
}

/** GET /api/users/by-username/:username -> a real user (with a real id) for "add by @username". */
export async function fetchUserByUsername(username: string): Promise<MessageUser> {
  const clean = username.trim().replace(/^@/, "")
  const res = await api.get<{ user: SerializedUser }>(
    `/users/by-username/${encodeURIComponent(clean)}`
  )
  const u = res.data.user
  return {
    id: u.id,
    username: u.username,
    name: u.name ?? u.username,
    avatar: u.avatar ?? avatarFor(u.username),
    bio: u.bio,
    isOnline: false,
  }
}
