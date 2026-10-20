import { useEffect, useRef } from "react"
import { CHATBOT_WELCOME } from "../../config/chatbot"
import { colors } from "../../theme"
import type { ChatbotMessage } from "../../types/chatbot"
import ChatbotMessageBubble from "./ChatbotMessageBubble"
import ChatbotSuggestions from "./ChatbotSuggestions"
import ChatbotTypingIndicator from "./ChatbotTypingIndicator"

interface ChatbotMessageListProps {
  messages: ChatbotMessage[]
  isLoading: boolean
  onPickSuggestion: (question: string) => void
  onRetry: () => void
}

export default function ChatbotMessageList({
  messages,
  isLoading,
  onPickSuggestion,
  onRetry,
}: ChatbotMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)

  // keep the newest message in view
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, isLoading])

  const lastIndex = messages.length - 1

  return (
    <div
      className="chat-scroll flex-1 min-h-0 px-4 py-4 space-y-3"
      style={{ backgroundColor: colors.background }}
      role="log"
      aria-live="polite"
    >
      {/* The welcome text is part of the UI only; it is never sent to the server as history. */}
      <div className="flex justify-start">
        <p
          className="max-w-[85%] px-3.5 py-2 text-sm leading-relaxed rounded-2xl rounded-bl-md"
          style={{ backgroundColor: colors.secondaryBackground, color: colors.text }}
        >
          {CHATBOT_WELCOME}
        </p>
      </div>

      {messages.length === 0 && <ChatbotSuggestions onPick={onPickSuggestion} />}

      {messages.map((message, index) => (
        <ChatbotMessageBubble
          key={message.id}
          message={message}
          onRetry={index === lastIndex && message.isError ? onRetry : undefined}
        />
      ))}

      {isLoading && <ChatbotTypingIndicator />}

      <div ref={endRef} />
    </div>
  )
}
