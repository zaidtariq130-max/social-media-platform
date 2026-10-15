import { useCallback, useEffect, useRef, useState } from "react"
import { getSocket } from "../socket/socket"
import type { AckResponse, ServerToClientEvents } from "../types/socket"
import type { Message } from "../types/messages"
import { mapMessage, sendMessageRest } from "../services/conversationService"

/** Handlers for every event the server can push. All optional. */
export type ChatSocketHandlers = {
  [E in keyof ServerToClientEvents]?: ServerToClientEvents[E]
} & {
  /** Fired after a re-connect, so the caller can re-sync anything it missed while offline. */
  reconnected?: () => void
}

const ACK_TIMEOUT_MS = 8000

function emitWithAck<T extends object>(event: string, payload: object): Promise<T> {
  return new Promise((resolve, reject) => {
    getSocket()
      .timeout(ACK_TIMEOUT_MS)
      .emit(event, payload, (err: Error | null, res: AckResponse<T>) => {
        if (err) return reject(new Error("The server did not respond. Please try again."))
        if (!res.ok) return reject(new Error(res.error))
        resolve(res)
      })
  })
}

/**
 * Subscribes to the chat events of the shared socket and exposes the emit helpers.
 * The connection itself is opened once for the whole app (see ProtectedLayout).
 */
export function useChatSocket(handlers: ChatSocketHandlers) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const [isConnected, setIsConnected] = useState(() => getSocket().connected)

  useEffect(() => {
    const socket = getSocket()
    let hasConnectedBefore = socket.connected

    const onConnect = () => {
      setIsConnected(true)
      socket.emit("presence:request")
      if (hasConnectedBefore) handlersRef.current.reconnected?.()
      hasConnectedBefore = true
    }
    const onDisconnect = () => setIsConnected(false)

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)

    // Forward each server event to the latest handler. Registered once; the ref keeps it fresh.
    const events = [
      "message:new",
      "message:deleted",
      "messages:read",
      "conversation:new",
      "conversation:updated",
      "conversation:deleted",
      "conversation:cleared",
      "typing",
      "presence:list",
      "presence:update",
    ] as const
    const forwarders = events.map((event) => {
      const fn = (payload: never) => {
        const handler = handlersRef.current[event] as ((p: never) => void) | undefined
        handler?.(payload)
      }
      socket.on(event as string, fn as (...args: unknown[]) => void)
      return [event, fn] as const
    })

    if (socket.connected) socket.emit("presence:request")

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      forwarders.forEach(([event, fn]) => socket.off(event as string, fn as (...args: unknown[]) => void))
    }
  }, [])

  /** Sends a message through the socket (falls back to REST when offline). */
  const sendMessage = useCallback(async (conversationId: string, text: string): Promise<Message> => {
    if (!getSocket().connected) return sendMessageRest(conversationId, text)
    const res = await emitWithAck<{ message: Parameters<typeof mapMessage>[0] }>("message:send", {
      conversationId,
      text,
    })
    return mapMessage(res.message)
  }, [])

  const emitTyping = useCallback((conversationId: string, isTyping: boolean) => {
    const socket = getSocket()
    if (socket.connected) socket.emit("typing", { conversationId, isTyping })
  }, [])

  const markRead = useCallback((conversationId: string) => {
    const socket = getSocket()
    if (socket.connected) socket.emit("conversation:read", { conversationId })
  }, [])

  return { isConnected, sendMessage, emitTyping, markRead }
}
