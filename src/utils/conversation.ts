import type { Conversation } from "../types/messages"

const same = (a?: string | null, b?: string | null) =>
  Boolean(a && b && String(a) === String(b))

/** True when the current user is the one who started this conversation. */
export function isRequestSender(conversation: Conversation, currentUserId: string): boolean {
  const { requestedBy, messages } = conversation
  return (
    same(requestedBy, currentUserId) ||
    (messages.length > 0 && same(messages[0].senderId, currentUserId))
  )
}

/** True when a pending message request is waiting for the current user to accept. */
export function isRequestReceiver(conversation: Conversation, currentUserId: string): boolean {
  return conversation.requestStatus === "pending" && !isRequestSender(conversation, currentUserId)
}

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
