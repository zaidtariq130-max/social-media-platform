import type { Conversation, FolderType, MessageUser } from "../types/messages"

/**
 * Cleared 1:1 threads stay in state (so New Message still shows "Message")
 * but must not appear in the inbox or the online-contacts strip.
 */
export function isHiddenEmptyThread(conv: Conversation): boolean {
  if (conv.isGroup) return false
  if (conv.isBlocked || conv.folder === "blocked") return false
  return !conv.messages?.length
}

/**
 * When searching, look across ALL folders. Otherwise show only the active folder
 * (blocked chats only appear in the "blocked" folder).
 */
export function filterConversations(
  conversations: Conversation[],
  activeFolder: FolderType,
  searchQuery: string
): Conversation[] {
  const q = searchQuery.toLowerCase().trim()

  return conversations.filter((conv) => {
    if (!conv?.participant) return false
    if (isHiddenEmptyThread(conv)) return false

    const isBlockedConv = conv.isBlocked || conv.folder === "blocked"

    // Blocked tab: only blocked users, even while searching
    if (activeFolder === "blocked" && !isBlockedConv) return false

    // Groups tab: only group conversations
    if (activeFolder === "groups" && !conv.isGroup) return false

    if (q) {
      const name = (conv.participant.name || "").toLowerCase()
      const username = (conv.participant.username || "").toLowerCase()
      const lastMsg = (conv.lastMessage || "").toLowerCase()
      const groupName = (conv.groupName || "").toLowerCase()
      return name.includes(q) || username.includes(q) || lastMsg.includes(q) || groupName.includes(q)
    }

    if (activeFolder === "blocked") return true
    if (activeFolder === "groups") return conv.isGroup === true
    if (conv.isBlocked) return false
    return conv.folder === activeFolder
  })
}

export function countBlocked(conversations: Conversation[]): number {
  return conversations.filter((c) => c.isBlocked || c.folder === "blocked").length
}

export function countGroups(conversations: Conversation[]): number {
  return conversations.filter((c) => c.isGroup === true).length
}

/** Unread messages across group chats — used for the Groups tab badge. */
export function countUnreadInGroups(conversations: Conversation[]): number {
  return conversations.reduce((sum, c) => (c.isGroup ? sum + (c.unreadCount || 0) : sum), 0)
}

/** Unique list of participants that are currently online. */
export function getOnlineContacts(conversations: Conversation[]): MessageUser[] {
  return conversations
    .filter((c) => !isHiddenEmptyThread(c) && !c.isGroup)
    .map((c) => c.participant)
    .filter((u, i, all) => u.isOnline && all.findIndex((s) => s.id === u.id) === i)
}
