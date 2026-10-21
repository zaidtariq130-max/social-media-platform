import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Conversation, Message } from "../types/messages"
import { fetchConversations, mapConversation, mapMessage } from "../services/conversationService"
import { useChatSocket, type ChatSocketHandlers } from "./useChatSocket"
import { formatClock } from "../utils/time"

/** Temp ids start with this prefix until the server confirms the message. */
const TEMP_PREFIX = "msg_tmp_"
/** Safety net: forget a "typing…" state if the stop event never arrives. */
const TYPING_TIMEOUT_MS = 5000

interface Options {
  currentUserId: string
  activeConversationId: string | null
}

type SendResult = { ok: true } | { ok: false; error: string }

/** Re-derives the list preview from the remaining messages. */
function withMessages(conv: Conversation, messages: Message[]): Conversation {
  const last = messages[messages.length - 1]
  return {
    ...conv,
    messages,
    lastMessage: last ? last.text : "",
    lastMessageTime: last ? new Date(last.createdAt).toISOString() : "",
  }
}

/**
 * Owns the conversation list: loads it once over REST, then keeps it in sync
 * through Socket.io events (new messages, typing, presence, read receipts).
 */
export function useConversations({ currentUserId, activeConversationId }: Options) {
  const [rawConversations, setConversations] = useState<Conversation[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [onlineIds, setOnlineIds] = useState<Set<string>>(() => new Set())
  const [typing, setTyping] = useState<Record<string, string[]>>({})
  const [isTabVisible, setIsTabVisible] = useState(() => !document.hidden)

  // latest values for use inside long-lived socket callbacks
  const conversationsRef = useRef(rawConversations)
  conversationsRef.current = rawConversations
  const currentUserIdRef = useRef(currentUserId)
  currentUserIdRef.current = currentUserId
  const typingTimers = useRef<Map<string, number>>(new Map())

  const reload = useCallback(async () => {
    try {
      setConversations(await fetchConversations())
    } catch {
      // keep whatever is on screen; the next reconnect tries again
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  useEffect(() => {
    const onVisibility = () => setIsTabVisible(!document.hidden)
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  const updateConversation = useCallback(
    (conversationId: string, fn: (c: Conversation) => Conversation) => {
      setConversations((prev) => prev.map((c) => (c.id === conversationId ? fn(c) : c)))
    },
    []
  )

  const clearTyping = useCallback((conversationId: string, userId: string) => {
    const key = `${conversationId}:${userId}`
    const timer = typingTimers.current.get(key)
    if (timer) window.clearTimeout(timer)
    typingTimers.current.delete(key)
    setTyping((prev) => {
      const users = prev[conversationId]
      if (!users?.includes(userId)) return prev
      return { ...prev, [conversationId]: users.filter((u) => u !== userId) }
    })
  }, [])

  const socketHandlers: ChatSocketHandlers = {
    "message:new": ({ conversationId, message: raw }) => {
      if (!conversationsRef.current.some((c) => c.id === conversationId)) {
        void reload() // a conversation we don't know yet (e.g. just created): fetch it
        return
      }
      const message = mapMessage(raw)
      const fromMe = message.senderId === currentUserIdRef.current
      clearTyping(conversationId, message.senderId)

      setConversations((prev) => {
        const conv = prev.find((c) => c.id === conversationId)
        if (!conv || conv.messages.some((m) => m.id === message.id)) return prev
        const updated: Conversation = {
          ...withMessages(conv, [...conv.messages, message]),
          unreadCount: fromMe ? conv.unreadCount : conv.unreadCount + 1,
        }
        // newest conversation first
        return [updated, ...prev.filter((c) => c.id !== conversationId)]
      })
    },

    "message:deleted": ({ conversationId, messageId }) =>
      updateConversation(conversationId, (c) =>
        withMessages(c, c.messages.filter((m) => m.id !== messageId))
      ),

    "messages:read": ({ conversationId, readerId }) =>
      updateConversation(conversationId, (c) =>
        readerId === currentUserIdRef.current
          ? { ...c, unreadCount: 0 } // read on another tab/device
          : {
              ...c,
              messages: c.messages.map((m) =>
                m.senderId === currentUserIdRef.current ? { ...m, status: "read" } : m
              ),
            }
      ),

    "conversation:new": ({ conversation }) =>
      setConversations((prev) =>
        prev.some((c) => c.id === conversation.id) ? prev : [mapConversation(conversation), ...prev]
      ),

    "conversation:deleted": ({ conversationId }) =>
      setConversations((prev) => prev.filter((c) => c.id !== conversationId)),

    // Only the user who cleared will receive this event (backend only emits to the user who cleared)
    "conversation:cleared": ({ conversationId }) =>
      updateConversation(conversationId, (c) => withMessages(c, [])),

    typing: ({ conversationId, userId, isTyping }) => {
      if (userId === currentUserIdRef.current) return
      if (!isTyping) return clearTyping(conversationId, userId)

      const key = `${conversationId}:${userId}`
      window.clearTimeout(typingTimers.current.get(key))
      typingTimers.current.set(
        key,
        window.setTimeout(() => clearTyping(conversationId, userId), TYPING_TIMEOUT_MS)
      )
      setTyping((prev) => {
        const users = prev[conversationId] ?? []
        return users.includes(userId) ? prev : { ...prev, [conversationId]: [...users, userId] }
      })
    },

    "presence:list": ({ userIds }) => setOnlineIds(new Set(userIds)),

    "presence:update": ({ userId, isOnline }) =>
      setOnlineIds((prev) => {
        if (prev.has(userId) === isOnline) return prev
        const next = new Set(prev)
        if (isOnline) next.add(userId)
        else next.delete(userId)
        return next
      }),

    reconnected: () => void reload(), // catch up on whatever happened while offline
  }

  const { isConnected, sendMessage: socketSend, emitTyping, markRead } = useChatSocket(socketHandlers)

  // Opening a chat (or receiving a message in the open chat) marks it as read.
  const activeUnread = rawConversations.find((c) => c.id === activeConversationId)?.unreadCount ?? 0
  useEffect(() => {
    if (!activeConversationId || activeUnread === 0 || !isTabVisible) return
    markRead(activeConversationId)
    updateConversation(activeConversationId, (c) => ({ ...c, unreadCount: 0 }))
  }, [activeConversationId, activeUnread, isTabVisible, markRead, updateConversation])

  // clear pending timers on unmount
  useEffect(() => {
    const timers = typingTimers.current
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [])

  /** Optimistic send: shows the message immediately, then swaps in the server copy. */
  const sendMessage = useCallback(
    async (conversationId: string, text: string): Promise<SendResult> => {
      const now = Date.now()
      const tempId = `${TEMP_PREFIX}${now}_${Math.random().toString(36).slice(2, 7)}`
      const temp: Message = {
        id: tempId,
        senderId: currentUserIdRef.current,
        text,
        createdAt: now,
        timestamp: formatClock(now),
        status: "sending",
      }

      setConversations((prev) => {
        const conv = prev.find((c) => c.id === conversationId)
        if (!conv) return prev
        return [withMessages(conv, [...conv.messages, temp]), ...prev.filter((c) => c.id !== conversationId)]
      })

      try {
        const saved = await socketSend(conversationId, text)
        updateConversation(conversationId, (c) => {
          // the live push of the same message may have arrived first: don't duplicate it
          const withoutTemp = c.messages.filter((m) => m.id !== tempId)
          const messages = withoutTemp.some((m) => m.id === saved.id)
            ? withoutTemp
            : c.messages.map((m) => (m.id === tempId ? saved : m))
          return withMessages(c, messages)
        })
        return { ok: true }
      } catch (err) {
        updateConversation(conversationId, (c) =>
          withMessages(c, c.messages.filter((m) => m.id !== tempId))
        )
        const error = (err as { response?: { data?: { message?: string } }; message?: string })
        return {
          ok: false,
          error: error.response?.data?.message ?? error.message ?? "Message could not be sent",
        }
      }
    },
    [socketSend, updateConversation]
  )

  // Merge live presence into the participants (groups have no single "online" state).
  const conversations = useMemo(
    () =>
      rawConversations.map((c) =>
        c.isGroup || !c.participant
          ? c
          : { ...c, participant: { ...c.participant, isOnline: onlineIds.has(c.participant.id) } }
      ),
    [rawConversations, onlineIds]
  )

  const isTypingIn = useCallback(
    (conversationId: string | null) => Boolean(conversationId && typing[conversationId]?.length),
    [typing]
  )

  return {
    conversations,
    setConversations,
    isLoaded,
    isConnected,
    isTypingIn,
    sendMessage,
    emitTyping,
    reload,
  }
}
