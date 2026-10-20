import { CHATBOT_SUGGESTIONS } from "../../config/chatbot"
import { colors } from "../../theme"

interface ChatbotSuggestionsProps {
  onPick: (question: string) => void
}

/** Quick-start questions, shown only while the conversation is empty. */
export default function ChatbotSuggestions({ onPick }: ChatbotSuggestionsProps) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {CHATBOT_SUGGESTIONS.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onPick(question)}
          className="text-xs text-left px-3 py-1.5 rounded-full border transition hover:shadow-sm cursor-pointer"
          style={{
            color: colors.primary,
            borderColor: colors.activeBorder,
            backgroundColor: colors.activeBackground,
          }}
        >
          {question}
        </button>
      ))}
    </div>
  )
}
