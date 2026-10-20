import { useState } from "react"
import type { CSSProperties } from "react"
import { useLocation } from "react-router-dom"
import { useChatbot } from "../../hooks/useChatbot"
import { gradients } from "../../theme"
import { ChatIcon, CloseIcon } from "../icons"
import ChatbotWindow from "./ChatbotWindow"

/**
 * The only chatbot component the rest of the app needs: a floating button (bottom-right)
 * that opens the chat window. Mounted once in routes/ProtectedLayout.tsx, so it is only
 * shown to logged-in users (the backend endpoint requires login too).
 */
export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const { messages, isLoading, send, retry, clear } = useChatbot()
  const { pathname } = useLocation()

  // On /messages the chat composer sits in the bottom-right corner, so lift everything above it.
  const bottom = pathname.startsWith("/messages") ? "6rem" : "1.25rem"

  return (
    <div
      className="fixed z-50 right-5"
      style={{ bottom, "--chatbot-bottom": bottom } as CSSProperties}
    >
      {isOpen && (
        <ChatbotWindow
          messages={messages}
          isLoading={isLoading}
          onSend={send}
          onRetry={retry}
          onClear={clear}
          onClose={() => setIsOpen(false)}
        />
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        title={isOpen ? "Close assistant" : "Need help?"}
        aria-label={isOpen ? "Close assistant" : "Open help assistant"}
        aria-expanded={isOpen}
        className="w-14 h-14 rounded-full text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
        style={{ backgroundImage: gradients.primary }}
      >
        {isOpen ? <CloseIcon className="w-6 h-6" /> : <ChatIcon className="w-6 h-6" />}
      </button>
    </div>
  )
}
