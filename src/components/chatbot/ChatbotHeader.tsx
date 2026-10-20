import { BOT_NAME } from "../../config/chatbot"
import { colors, gradients } from "../../theme"
import { CloseIcon, SparklesIcon, TrashIcon } from "../icons"

interface ChatbotHeaderProps {
  canClear: boolean
  onClear: () => void
  onClose: () => void
}

export default function ChatbotHeader({ canClear, onClear, onClose }: ChatbotHeaderProps) {
  const buttonClass =
    "p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none"

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 text-white shrink-0"
      style={{ backgroundImage: gradients.primary }}
    >
      <span
        className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0"
        style={{ color: colors.background }}
      >
        <SparklesIcon className="w-5 h-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm truncate">{BOT_NAME}</p>
        <p className="text-xs text-white/80">Ask me about the app</p>
      </div>

      <button type="button" onClick={onClear} disabled={!canClear} className={buttonClass} title="Clear chat" aria-label="Clear chat">
        <TrashIcon className="w-4 h-4" />
      </button>
      <button type="button" onClick={onClose} className={buttonClass} title="Close" aria-label="Close assistant">
        <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  )
}
