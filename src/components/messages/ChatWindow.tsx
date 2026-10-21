import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import type { Conversation } from "../../types/messages"
import { colors } from "../../theme"
import { formatDayLabel, formatMessageTime, isSameDay } from "../../utils/time"
import Avatar from "../common/Avatar"
import IconButton from "../common/IconButton"
import {
  ArrowLeftIcon,
  InfoIcon,
  SendIcon,
  HeartIcon,
  CheckIcon,
  CheckCheckIcon,
  TrashIcon,
  ChatIcon,
  ClockIcon,
} from "../icons"

const REACTIONS = ["❤️", "😂", "😮", "😢", "👍"]
const MAX_LENGTH = 2000
/** Stop announcing "typing…" after this much idle time. */
const TYPING_IDLE_MS = 2000

interface Props {
  conversation: Conversation | null | undefined
  currentUserId: string
  isTyping: boolean
  onSendMessage: (text: string) => void
  onSendHeart: () => void
  onToggleBlockUser: (conversationId: string) => void
  onClearMessages: (conversationId: string) => void
  onToggleMute: (conversationId: string) => void
  onDeleteSingleMessage: (conversationId: string, messageId: string) => void
  onToggleMessageReaction: (conversationId: string, messageId: string, emoji: string) => void
  onBackToList: () => void
  onToggleInfoDrawer: () => void
  /** Called when the local user starts / stops typing in a conversation. */
  onTyping?: (conversationId: string, isTyping: boolean) => void
}

export default function ChatWindow({
  conversation,
  currentUserId,
  isTyping,
  onSendMessage,
  onSendHeart,
  onToggleBlockUser,
  onClearMessages,
  onBackToList,
  onToggleInfoDrawer,
  onDeleteSingleMessage,
  onToggleMessageReaction,
  onTyping,
}: Props) {
  const [text, setText] = useState("")
  const [reactionFor, setReactionFor] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const messageCount = conversation?.messages.length ?? 0
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messageCount, isTyping, conversation?.id])

  // --- "typing…" announcements -------------------------------------------------
  const onTypingRef = useRef(onTyping)
  onTypingRef.current = onTyping
  const typingState = useRef<{ conversationId: string | null; timer?: number }>({ conversationId: null })

  const stopTyping = useCallback(() => {
    const state = typingState.current
    window.clearTimeout(state.timer)
    if (state.conversationId) onTypingRef.current?.(state.conversationId, false)
    state.conversationId = null
  }, [])

  function notifyTyping(value: string, conversationId: string) {
    const state = typingState.current
    if (!value.trim()) return stopTyping()
    if (state.conversationId !== conversationId) {
      stopTyping()
      state.conversationId = conversationId
      onTypingRef.current?.(conversationId, true)
    }
    window.clearTimeout(state.timer)
    state.timer = window.setTimeout(stopTyping, TYPING_IDLE_MS)
  }

  const conversationId = conversation?.id
  useEffect(() => {
    setText("")
    setReactionFor(null)
    return stopTyping // leaving this chat: tell the other side we stopped
  }, [conversationId, stopTyping])

  if (!conversation) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3"
        style={{ backgroundColor: colors.background, color: colors.mutedText }}
      >
        <ChatIcon className="w-12 h-12" />
        <h3 className="font-bold text-base" style={{ color: colors.text }}>
          Your messages
        </h3>
        <p className="text-sm">Select a conversation or start a new one.</p>
      </div>
    )
  }

  const { id, participant, isBlocked, isGroup, groupName } = conversation
  const title = isGroup ? groupName || participant.name : participant.name
  const canSend = !isBlocked && text.trim().length > 0

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!canSend) return
    stopTyping()
    onSendMessage(text.trim())
    setText("")
  }

  return (
    <div className="flex flex-col h-full min-h-0 flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div
        className="p-3 border-b flex items-center gap-3 shrink-0"
        style={{ borderColor: colors.border }}
      >
        <IconButton onClick={onBackToList} className="md:hidden" title="Back">
          <ArrowLeftIcon className="w-5 h-5" />
        </IconButton>
        <Avatar src={participant.avatar} alt={title} size="md" isOnline={isGroup ? undefined : participant.isOnline} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate" style={{ color: colors.text }}>
            {title}
          </p>
          <p className="text-xs truncate" style={{ color: colors.mutedText }}>
            {isTyping
              ? "typing…"
              : isGroup
              ? "Group"
              : participant.isOnline
              ? "Active now"
              : participant.lastSeen || `@${participant.username}`}
          </p>
        </div>
        <IconButton onClick={onToggleInfoDrawer} title="Conversation info">
          <InfoIcon className="w-5 h-5" />
        </IconButton>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
        {conversation.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center mt-12 gap-2">
            <Avatar src={participant.avatar} alt={title} size="lg" />
            <p className="text-sm font-semibold" style={{ color: colors.text }}>
              {title}
            </p>
            <p className="text-xs font-medium text-blue-600">✨ Start a new conversation</p>
          </div>
        )}

        {conversation.messages.map((m, index) => {
          const mine = String(m.senderId) === String(currentUserId)
          const prev = conversation.messages[index - 1]
          const showDay = !prev || !isSameDay(prev.createdAt, m.createdAt)
          return (
            <div key={m.id}>
              {showDay && (
                <div className="flex justify-center my-3">
                  <span
                    className="text-[11px] px-3 py-1 rounded-full"
                    style={{ backgroundColor: colors.secondaryBackground, color: colors.mutedText }}
                  >
                    {formatDayLabel(m.createdAt)}
                  </span>
                </div>
              )}
            <div className={`group flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-1">
                  {mine && (
                    <button
                      type="button"
                      title="Delete message"
                      onClick={() => onDeleteSingleMessage(id, m.id)}
                      className="opacity-0 group-hover:opacity-100 transition p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div
                    onDoubleClick={() => setReactionFor(reactionFor === m.id ? null : m.id)}
                    className={`px-3.5 py-2 rounded-2xl text-sm break-words whitespace-pre-wrap ${
                      mine ? "text-white rounded-br-md" : "rounded-bl-md"
                    }`}
                    style={
                      mine
                        ? { backgroundColor: colors.primary }
                        : { backgroundColor: colors.secondaryBackground, color: colors.text }
                    }
                  >
                    {m.text}
                  </div>
                  {!mine && (
                    <button
                      type="button"
                      title="Delete message"
                      onClick={() => onDeleteSingleMessage(id, m.id)}
                      className="opacity-0 group-hover:opacity-100 transition p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {reactionFor === m.id && (
                  <div className="flex gap-1 mt-1 bg-white border rounded-full px-2 py-1 shadow-sm" style={{ borderColor: colors.border }}>
                    {REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className="text-base hover:scale-125 transition cursor-pointer"
                        onClick={() => {
                          onToggleMessageReaction(id, m.id, emoji)
                          setReactionFor(null)
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {m.reactions && m.reactions.length > 0 && (
                  <div className="flex gap-0.5 -mt-1 text-xs bg-white border rounded-full px-1.5 shadow-sm" style={{ borderColor: colors.border }}>
                    {m.reactions.map((r, i) => (
                      <span key={i}>{r}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 mt-0.5 text-[10px]" style={{ color: colors.mutedText }}>
                  <span>{formatMessageTime(m.timestamp)}</span>
                  {mine &&
                    (m.status === "sending" ? (
                      <ClockIcon className="w-3 h-3" />
                    ) : m.status === "read" || m.status === "delivered" ? (
                      <CheckCheckIcon className={`w-3 h-3 ${m.status === "read" ? "text-blue-500" : ""}`} />
                    ) : (
                      <CheckIcon className="w-3 h-3" />
                    ))}
                </div>
              </div>
            </div>
            </div>
          )
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="px-3.5 py-2 rounded-2xl rounded-bl-md text-sm" style={{ backgroundColor: colors.secondaryBackground, color: colors.mutedText }}>
              <span className="inline-flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      <div className="border-t p-3 shrink-0" style={{ borderColor: colors.border }}>
        {isBlocked ? (
          <div className="text-center space-y-2">
            <p className="text-xs" style={{ color: colors.mutedText }}>You blocked this user.</p>
            <div className="flex justify-center gap-2">
              <button type="button" onClick={() => onToggleBlockUser(id)} className="px-4 py-1.5 rounded-full text-xs font-semibold border cursor-pointer" style={{ borderColor: colors.border }}>
                Unblock
              </button>
              <button type="button" onClick={() => onClearMessages(id)} className="px-4 py-1.5 rounded-full text-xs font-semibold text-rose-600 border border-rose-200 cursor-pointer">
                Delete chat
              </button>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={submit} className="flex items-center gap-2">
              <input
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  notifyTyping(e.target.value, id)
                }}
                maxLength={MAX_LENGTH}
                placeholder="Message…"
                className="flex-1 rounded-full px-4 py-2 text-sm outline-none"
                style={{ backgroundColor: colors.inputBackground, color: colors.text }}
              />
              {text.trim() ? (
                <IconButton type="submit" disabled={!canSend} style={{ color: colors.primary }} title="Send">
                  <SendIcon className="w-5 h-5" />
                </IconButton>
              ) : (
                <IconButton onClick={onSendHeart} style={{ color: colors.danger }} title="Send heart">
                  <HeartIcon className="w-5 h-5" />
                </IconButton>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  )
}
