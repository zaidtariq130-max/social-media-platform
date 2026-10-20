# Chatbot UI

Floating help assistant (bottom-right button -> chat window). It talks to `POST /api/chatbot`
(see `backend/src/chatbot` and the "Chatbot" section of `backend/README.md`).

## Files

| File | Job |
| --- | --- |
| `ChatbotWidget.tsx` | Entry point. Launcher button + open/close state. The only thing other code imports. |
| `ChatbotWindow.tsx` | The panel: header, message list, input. No state of its own. |
| `ChatbotHeader.tsx` | Title, "clear chat" and close buttons. |
| `ChatbotMessageList.tsx` | Welcome text, quick questions, bubbles, typing dots, auto-scroll. |
| `ChatbotMessageBubble.tsx` | One bubble (user / bot / error with "Try again"). |
| `ChatbotSuggestions.tsx` | Quick-start question chips (shown while the chat is empty). |
| `ChatbotTypingIndicator.tsx` | Three bouncing dots while waiting for the answer. |
| `ChatbotInput.tsx` | Textarea + send button. Enter sends, Shift+Enter = new line, 500 char limit. |

Outside this folder:

| File | Job |
| --- | --- |
| `src/hooks/useChatbot.ts` | All state and logic (send, retry, clear, loading, errors). |
| `src/services/chatbotService.ts` | The API call + building the history sent to the server. |
| `src/types/chatbot.ts` | Types. |
| `src/config/chatbot.ts` | Bot name, welcome text, quick questions, limits, error texts. |
| `src/routes/ProtectedLayout.tsx` | Mounts `<ChatbotWidget />` once (logged-in area only). |

## Common changes

- Change the welcome text or quick questions -> `src/config/chatbot.ts`
- Change colours -> they come from `src/theme`, nothing is hard-coded here
- Change what the bot knows or how it answers -> backend only (`backend/src/chatbot/knowledge.js`, `systemPrompt.js`)
- Remove the chatbot completely -> delete this folder, the files in the table above, and the 2 lines in `ProtectedLayout.tsx`

The chat is kept in memory only: it stays when the window is closed, and is cleared on refresh / logout.
