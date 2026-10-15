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
