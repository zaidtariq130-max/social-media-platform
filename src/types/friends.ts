import type { MessageUser } from "./messages"

export type RelationshipStatus = "none" | "friends" | "request_sent" | "request_received"

export interface Relationship {
  status: RelationshipStatus
  /** Id of the friend request / friendship, when there is one. */
  requestId?: string
}

/** A user in the People tab, with how the logged-in user relates to them. */
export interface Person extends MessageUser {
  relationship: Relationship
}

export interface FriendRequest {
  id: string
  direction: "incoming" | "outgoing"
  createdAt: string
  user: MessageUser
}

export interface Friend extends MessageUser {
  friendshipId: string
}

export interface UserStats {
  postsCount: number
  friendsCount: number
  requestsCount: number
}
