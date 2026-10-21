import api from "../api/axios"
import type { MessageUser } from "../types/messages"
import type { Friend, FriendRequest, Person, Relationship, UserStats } from "../types/friends"
import { avatarFor } from "../utils/avatar"

/** What the backend sends for a user (see serializeUser). */
interface ApiUser {
  id: string
  username: string
  name?: string
  avatar?: string
  bio?: string
}

const toUser = (u: ApiUser): MessageUser => ({
  id: u.id,
  username: u.username,
  name: u.name ?? u.username,
  avatar: u.avatar ?? avatarFor(u.username),
  bio: u.bio,
  isOnline: false,
})

/** GET /api/friends/people — other users and my relationship to each. */
export async function fetchPeople(search = ""): Promise<Person[]> {
  const res = await api.get<{ people: (ApiUser & { relationship: Relationship })[] }>(
    "/friends/people",
    { params: search ? { q: search } : undefined }
  )
  return res.data.people.map((p) => ({ ...toUser(p), relationship: p.relationship }))
}

/** GET /api/friends/requests?type=incoming|outgoing */
export async function fetchRequests(type: "incoming" | "outgoing"): Promise<FriendRequest[]> {
  const res = await api.get<{
    requests: { id: string; direction: "incoming" | "outgoing"; createdAt: string; user: ApiUser }[]
  }>("/friends/requests", { params: { type } })
  return res.data.requests.map((r) => ({
    id: r.id,
    direction: r.direction,
    createdAt: r.createdAt,
    user: toUser(r.user),
  }))
}

/** GET /api/friends */
export async function fetchFriends(): Promise<Friend[]> {
  const res = await api.get<{ friends: (ApiUser & { friendshipId: string })[] }>("/friends")
  return res.data.friends.map((f) => ({ ...toUser(f), friendshipId: f.friendshipId }))
}

export async function sendFriendRequest(userId: string): Promise<void> {
  await api.post("/friends/requests", { userId })
}

export async function respondToFriendRequest(
  requestId: string,
  action: "accept" | "decline"
): Promise<void> {
  await api.put(`/friends/requests/${requestId}`, { action })
}

export async function cancelFriendRequest(requestId: string): Promise<void> {
  await api.delete(`/friends/requests/${requestId}`)
}

export async function removeFriend(userId: string): Promise<void> {
  await api.delete(`/friends/${userId}`)
}

/** GET /api/users/me/stats — real posts / friends / pending requests numbers. */
export async function fetchMyStats(): Promise<UserStats> {
  const res = await api.get<{ stats: UserStats }>("/users/me/stats")
  return res.data.stats
}
