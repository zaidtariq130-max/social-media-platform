import { colors, gradients } from "../../theme"
import type { ChatbotMessage } from "../../types/chatbot"

interface ChatbotMessageBubbleProps {
  message: ChatbotMessage
  /** only passed for the latest error bubble */
  onRetry?: () => void
}

export default function ChatbotMessageBubble({ message, onRetry }: ChatbotMessageBubbleProps) {
  const isUser = message.role === "user"

  const style = isUser
    ? { backgroundImage: gradients.primary, color: "#ffffff" }
    : message.isError
    ? { backgroundColor: colors.dangerBackground, color: colors.danger }
    : { backgroundColor: colors.secondaryBackground, color: colors.text }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] px-3.5 py-2 text-sm leading-relaxed rounded-2xl ${
          isUser ? "rounded-br-md" : "rounded-bl-md"
        }`}
        style={style}
      >
        {/* plain text only: React escapes it, and the bot is told not to use markdown */}
        <p className="whitespace-pre-wrap break-words">{message.text}</p>

        {message.isError && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-1.5 text-xs font-semibold underline underline-offset-2 cursor-pointer"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
