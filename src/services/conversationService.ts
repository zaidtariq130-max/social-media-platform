import api from "../api/axios"
import type { Conversation, Message } from "../types/messages"
import type { RawConversation, RawMessage } from "../types/socket"
import { formatClock } from "../utils/time"

/** Normalises a message from the API / socket into the shape the UI uses. */
export function mapMessage(m: RawMessage): Message {
  const createdAt = typeof m.createdAt === "number" ? m.createdAt : new Date(m.createdAt).getTime()
  return {
    id: String(m.id),
    senderId: String(m.senderId),
    text: m.text,
    createdAt,
    // rendered in the viewer's own timezone, not the server's
    timestamp: formatClock(createdAt),
    status: m.status ?? "delivered",
    reactions: m.reactions ?? [],
  }
}

/** Normalises a conversation from the API / socket. */
export function mapConversation(c: RawConversation): Conversation {
  return {
    ...(c as Conversation),
    messages: (c.messages ?? []).map((m) => mapMessage(m as unknown as RawMessage)),
    folder: c.folder ?? "primary",
    isBlocked: c.isBlocked ?? false,
    isMuted: c.isMuted ?? false,
    unreadCount: c.unreadCount ?? 0,
    lastMessage: c.lastMessage ?? "",
    lastMessageTime: c.lastMessageTime ?? "",
  }
}

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await api.get("/conversations")
  return ((res.data.conversations ?? []) as RawConversation[]).map(mapConversation)
}

/** REST fallback used only when the socket is not connected. */
export async function sendMessageRest(conversationId: string, text: string): Promise<Message> {
  const res = await api.post(`/conversations/${conversationId}/messages`, { text })
  return mapMessage(res.data.message)
}
