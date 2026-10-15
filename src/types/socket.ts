import type { Conversation, Message, RequestStatus } from "./messages"

/** Payloads of events the server pushes to the client. */
export interface ServerToClientEvents {
  "message:new": (p: { conversationId: string; message: RawMessage }) => void
  "message:deleted": (p: { conversationId: string; messageId: string }) => void
  "messages:read": (p: { conversationId: string; readerId: string }) => void
  "conversation:new": (p: { conversation: RawConversation }) => void
  "conversation:updated": (p: { conversationId: string; requestStatus: RequestStatus }) => void
  "conversation:deleted": (p: { conversationId: string }) => void
  "conversation:cleared": (p: { conversationId: string }) => void
  typing: (p: { conversationId: string; userId: string; isTyping: boolean }) => void
  "presence:list": (p: { userIds: string[] }) => void
  "presence:update": (p: { userId: string; isOnline: boolean }) => void
}

/** Ack the server answers with for events that expect a reply. */
export type AckResponse<T = object> = ({ ok: true } & T) | { ok: false; error: string }

/** Shapes coming straight from the API, before they are normalised. */
export type RawMessage = Omit<Message, "timestamp" | "reactions" | "status"> & {
  timestamp?: string
  reactions?: string[]
  status?: Message["status"]
}

export type RawConversation = Partial<Conversation> & Pick<Conversation, "id">
