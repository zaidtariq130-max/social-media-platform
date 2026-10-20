import { useEffect } from "react"
import { colors } from "../../theme"
import type { ChatbotMessage } from "../../types/chatbot"
import ChatbotHeader from "./ChatbotHeader"
import ChatbotInput from "./ChatbotInput"
import ChatbotMessageList from "./ChatbotMessageList"

interface ChatbotWindowProps {
  messages: ChatbotMessage[]
  isLoading: boolean
  onSend: (text: string) => void
  onRetry: () => void
  onClear: () => void
  onClose: () => void
}

/**
 * The chat panel itself: header + messages + input. Has no state of its own (see useChatbot).
 * Positioned relative to the wrapper in ChatbotWidget (just above the launcher button).
 */
export default function ChatbotWindow({
  messages,
  isLoading,
  onSend,
  onRetry,
  onClear,
  onClose,
}: ChatbotWindowProps) {
  // Escape closes the window
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  return (
    <section
      role="dialog"
      aria-label="Help assistant"
      className="absolute right-0 bottom-[4.5rem] w-[min(24rem,calc(100vw-2.5rem))] h-[min(34rem,calc(100dvh-var(--chatbot-bottom)-6rem))] flex flex-col overflow-hidden rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{ backgroundColor: colors.background, borderColor: colors.border }}
    >
      <ChatbotHeader canClear={messages.length > 0} onClear={onClear} onClose={onClose} />
      <ChatbotMessageList
        messages={messages}
        isLoading={isLoading}
        onPickSuggestion={onSend}
        onRetry={onRetry}
      />
      <ChatbotInput disabled={isLoading} onSend={onSend} />
    </section>
  )
}
