import { useEffect, useRef, useState } from "react"
import type { FormEvent, KeyboardEvent } from "react"
import { CHATBOT_LIMITS } from "../../config/chatbot"
import { colors } from "../../theme"
import { SendIcon } from "../icons"

interface ChatbotInputProps {
  disabled: boolean
  onSend: (text: string) => void
}

/** Enter sends, Shift+Enter adds a new line. */
export default function ChatbotInput({ disabled, onSend }: ChatbotInputProps) {
  const [text, setText] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // focus when the window opens
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // grow with the text, up to about 4 lines
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`
  }, [text])

  const canSend = text.trim().length > 0 && !disabled

  const submit = () => {
    if (!canSend) return
    onSend(text)
    setText("")
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  const nearLimit = text.length >= CHATBOT_LIMITS.MESSAGE_MAX * 0.8

  return (
    <form onSubmit={handleSubmit} className="border-t px-3 py-3 shrink-0" style={{ borderColor: colors.border }}>
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={CHATBOT_LIMITS.MESSAGE_MAX}
          placeholder="Type your question…"
          aria-label="Type your question"
          className="flex-1 resize-none rounded-2xl px-4 py-2 text-sm outline-none"
          style={{ backgroundColor: colors.inputBackground, color: colors.text }}
        />
        <button
          type="submit"
          disabled={!canSend}
          title="Send"
          aria-label="Send"
          className="p-2.5 rounded-full text-white transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          style={{ backgroundColor: colors.primary }}
        >
          <SendIcon className="w-4 h-4" />
        </button>
      </div>

      {nearLimit && (
        <p className="mt-1 text-right text-[11px]" style={{ color: colors.mutedText }}>
          {text.length}/{CHATBOT_LIMITS.MESSAGE_MAX}
        </p>
      )}
    </form>
  )
}
