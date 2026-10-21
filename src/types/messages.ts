export interface MessageUser {
  id: string
  username: string
  name: string
  avatar: string
  bio?: string
  isOnline: boolean
  lastSeen?: string
  isVerified?: boolean
  followersCount?: number
  postsCount?: number
}

export type MessageStatus = "sending" | "sent" | "delivered" | "read"

export interface Message {
  id: string
  senderId: string
  text: string
  timestamp: string
  createdAt: number
  status: MessageStatus
  reactions?: string[]
}

export type FolderType = "primary" | "blocked" | "groups"

export interface Conversation {
  id: string
  participant: MessageUser
  messages: Message[]
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  folder: FolderType
  isBlocked: boolean
  isMuted: boolean
  isGroup?: boolean
  groupName?: string
  /** User ids of everyone in the conversation (sent by the server). */
  memberIds?: string[]
  createdAt: number
}
