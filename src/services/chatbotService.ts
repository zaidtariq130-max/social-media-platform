import api from "../api/axios"
import { CHATBOT_LIMITS } from "../config/chatbot"
import type { ChatbotHistoryItem, ChatbotMessage } from "../types/chatbot"

/** Last few real turns only (error bubbles are local), trimmed to what the backend accepts. */
export function buildHistory(messages: ChatbotMessage[]): ChatbotHistoryItem[] {
  return messages
    .filter((m) => !m.isError)
    .slice(-CHATBOT_LIMITS.HISTORY_MAX_ITEMS)
    .map((m) => ({ role: m.role, text: m.text.slice(0, CHATBOT_LIMITS.HISTORY_ITEM_MAX) }))
}

/** POST /api/chatbot -> the bot's plain-text reply. Errors are thrown for the caller to handle. */
export async function sendChatbotMessage(
  message: string,
  history: ChatbotHistoryItem[]
): Promise<string> {
  const res = await api.post("/chatbot", { message, history })
  return String(res.data.reply ?? "")
}
