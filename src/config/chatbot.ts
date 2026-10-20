import { APP_NAME } from "./app"

/**
 * Chatbot settings for the frontend.
 * The LIMITS must match backend/src/chatbot/config.js, otherwise the server rejects the request (400).
 */
export const BOT_NAME = `${APP_NAME} Assistant`

export const CHATBOT_LIMITS = {
  /** one question */
  MESSAGE_MAX: 500,
  /** how many earlier messages are sent along with a new question */
  HISTORY_MAX_ITEMS: 10,
  /** one earlier message */
  HISTORY_ITEM_MAX: 1000,
} as const

export const CHATBOT_WELCOME = `Hi! I'm ${BOT_NAME}. I can help you with posts, messages, group chats and your account. What would you like to know?`

/** Quick-start questions shown before the first message. Keep them answerable from the backend knowledge. */
export const CHATBOT_SUGGESTIONS = [
  "How do I start a chat?",
  "How do I create a post?",
  "Why can't I reply to a message?",
  "What is the difference between clear chat and delete conversation?",
] as const

export const CHATBOT_ERRORS = {
  NETWORK: "I can't reach the server right now. Please check your connection and try again.",
  GENERIC: "Something went wrong. Please try again in a moment.",
} as const
