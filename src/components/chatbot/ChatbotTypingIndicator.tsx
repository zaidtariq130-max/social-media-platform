import { colors } from "../../theme"

/** Three bouncing dots shown while the bot is answering. */
export default function ChatbotTypingIndicator() {
  return (
    <div className="flex justify-start" role="status" aria-label="Assistant is typing">
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1"
        style={{ backgroundColor: colors.secondaryBackground }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{ backgroundColor: colors.mutedText, animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
