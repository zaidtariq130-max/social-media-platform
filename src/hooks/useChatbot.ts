import { useCallback, useRef, useState } from "react"
import { CHATBOT_ERRORS } from "../config/chatbot"
import { buildHistory, sendChatbotMessage } from "../services/chatbotService"
import type { ChatbotMessage } from "../types/chatbot"
import { parseApiError } from "../utils/errors"

let nextId = 0
const makeMessage = (role: ChatbotMessage["role"], text: string, isError = false): ChatbotMessage => ({
  id: `bot-${Date.now()}-${nextId++}`,
  role,
  text,
  isError,
})

/**
 * All chatbot state and logic. The UI components only render what this returns.
 * The conversation lives in memory: it survives closing the window, and is cleared on refresh / logout.
 */
export function useChatbot() {
  const [messages, setMessages] = useState<ChatbotMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  // Bumped by "clear", so a reply that arrives after clearing is ignored.
  const requestToken = useRef(0)

  const ask = useCallback(async (text: string, previous: ChatbotMessage[]) => {
    const token = ++requestToken.current
    setMessages([...previous, makeMessage("user", text)])
    setIsLoading(true)

    let answer: ChatbotMessage
    try {
      const reply = await sendChatbotMessage(text, buildHistory(previous))
      answer = makeMessage("model", reply)
    } catch (error) {
      const { hasResponse, message } = parseApiError(error)
      answer = makeMessage(
        "model",
        hasResponse ? (message ?? CHATBOT_ERRORS.GENERIC) : CHATBOT_ERRORS.NETWORK,
        true
      )
    }

    if (token !== requestToken.current) return
    setMessages((current) => [...current, answer])
    setIsLoading(false)
  }, [])

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim()
      if (!text || isLoading) return
      void ask(text, messages)
    },
    [ask, isLoading, messages]
  )

  /** After an error bubble: drop the failed question + error and ask the same question again. */
  const retry = useCallback(() => {
    const failedQuestion = messages[messages.length - 2]
    if (isLoading || !messages[messages.length - 1]?.isError || failedQuestion?.role !== "user") return
    void ask(failedQuestion.text, messages.slice(0, -2))
  }, [ask, isLoading, messages])

  const clear = useCallback(() => {
    requestToken.current++
    setMessages([])
    setIsLoading(false)
  }, [])

  return { messages, isLoading, send, retry, clear }
}
