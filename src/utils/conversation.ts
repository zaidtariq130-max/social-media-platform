import type { Conversation } from "../types/messages"

/** Finds the existing 1-to-1 conversation with a given username (case-insensitive). */
export function findDirectConversation(
  conversations: Conversation[],
  username: string
): Conversation | undefined {
  return findConversationWithUser(conversations, { username })
}

/** Finds the 1-to-1 thread with this user by id first, then username. */
export function findConversationWithUser(
  conversations: Conversation[],
  user: { id?: string; username?: string }
): Conversation | undefined {
  const target = user.username?.toLowerCase()
  return conversations.find((c) => {
    if (c.isGroup || !c.participant) return false
    if (user.id && String(c.participant.id) === String(user.id)) return true
    return Boolean(target && c.participant.username?.toLowerCase() === target)
  })
}
