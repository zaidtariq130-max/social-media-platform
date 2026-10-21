# Social Media Backend

REST API + Socket.io (chat, presence) built with Express 5, MongoDB (Mongoose) and zod.

## Quick start

```bash
npm install
cp .env.example .env     # then fill MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET
npm run dev              # http://localhost:5000
npm test                 # unit + HTTP tests (no database needed)
npm run lint
```

Generate the two secrets with:
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## Folder structure

```
src/
  config/       env (the only place that reads process.env), db, constants
  routes/       URL -> middleware -> controller
  validators/   zod schemas for body / params / query
  controllers/  thin HTTP layer
  services/     business logic (auth, conversations, messages, posts, users)
  models/       Mongoose schemas
  serializers/  DB document -> JSON the frontend expects
  middleware/   auth, validation, rate limits, same-origin (CSRF) guard, errors
  socket/       Socket.io server, chat handlers, presence
  chatbot/      Gemini chatbot: config, platform knowledge, system prompt
  utils/        tokens, logger, AppError, id helpers
scripts/        chatbot prompt evaluation (npm run chatbot:eval)
tests/          node:test files
```

## API overview

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/auth/signup`, `/login` | returns `{ token, user }` + sets refresh cookie |
| POST | `/api/auth/refresh`, `/logout` | cookie based, same-origin guarded |
| GET | `/api/auth/profile` | |
| GET/POST/PUT/DELETE | `/api/posts` | |
| GET | `/api/users?q=` | list / search |
| GET | `/api/users/by-username/:username` | exact lookup for "add by @username" |
| GET | `/api/users/me/stats` | real `postsCount`, `friendsCount`, `requestsCount` for the profile page |
| GET | `/api/friends`, `/api/friends/people?q=` | my friends / other users with my relationship to each |
| GET/POST | `/api/friends/requests` | `?type=incoming\|outgoing` / send `{ userId }` |
| PUT | `/api/friends/requests/:id` | receiver answers `{ action: "accept" \| "decline" }` |
| DELETE | `/api/friends/requests/:id`, `/api/friends/:userId` | sender cancels a pending request / unfriend |
| GET/POST | `/api/conversations`, `/api/conversations/group` | |
| PUT | `/api/conversations/:id/accept`, `/clear`, `/block` | `clear` hides history for *you only* |
| DELETE | `/api/conversations/:id` | removes the chat **for both users** |
| GET/POST/DELETE | `/api/conversations/:id/messages[/:messageId]` | `DELETE` = for everyone |
| PUT | `/api/conversations/:id/messages/:messageId/delete-for-me` | |
| POST | `/api/chatbot` | Gemini help assistant, see "Chatbot" below |

## Notes

- **Unique indexes:** `username` (case-insensitive) and `directKey` (one 1-to-1 chat per pair of
  users) are enforced by MongoDB. If your database already contains duplicate usernames, MongoDB
  cannot build the username index until they are renamed.
- **CSRF:** `/auth/refresh` and `/auth/logout` reject requests whose `Origin` header is not
  `CLIENT_URL`.
- **Friend requests** live in one `Friendship` document per pair of users (`pending` -> `accepted` or
  `declined`; unique `pairKey`). Socket events `friend:request` / `friend:updated` tell the other user
  to refresh. A declined pair can send a new request later.
- **Presence** is kept in memory. Running several server instances needs the Socket.io Redis adapter.

## Chatbot (Google Gemini)

A help assistant that only answers questions about this platform. It is stateless: the browser sends
the last few turns with every request and the server stores nothing.

```
POST /api/chatbot        (Authorization: Bearer <accessToken>)
{ "message": "How do I start a group chat?",
  "history": [ { "role": "user", "text": "..." }, { "role": "model", "text": "..." } ] }   // history optional

200 { "success": true, "reply": "Open Messages, then ..." }
400 invalid input   401 not logged in   429 too many requests   503 chatbot not configured / Gemini down
```

Limits: message up to 500 characters, history up to 10 items (1000 characters each), 15 requests per user
per minute (`RATE_LIMIT_CHATBOT_MAX`).

**Setup:** add `GEMINI_API_KEY` to `.env` (see `.env.example`). Model defaults to `gemini-3.5-flash`
(`GEMINI_MODEL` to change it). Older `gemini-2.5-*` and `gemini-2.0-*` models are shut down by Google.

**Gemini overloaded (503 "high demand")?** The service retries temporary errors (429, 500, 503, 504) twice with a short
wait, then switches to `GEMINI_FALLBACK_MODEL` (default `gemini-3.1-flash-lite`, empty = off) and tries it twice too.
No new attempt starts after 20 seconds in total (`TOTAL_BUDGET_MS`).
Wrong keys and bad requests are not retried. The numbers live in `RETRY` in `src/chatbot/config.js`.

**Where things live**

| File | What to change there |
| --- | --- |
| `src/chatbot/knowledge.js` | The facts the bot knows. Update it whenever a feature is added, changed or removed. Keep the "NOT AVAILABLE" list honest. |
| `src/chatbot/systemPrompt.js` | Behaviour: scope, off-topic handling, security rules, tone, language, examples. |
| `src/chatbot/config.js` | Input limits, token limit, fallback messages, retry settings. |
| `src/services/chatbot.service.js` | The Gemini call, safety settings, error handling. |
| `scripts/chatbotEvalCases.js` | Prompt test cases. Add a case whenever you see a bad answer. |

**Testing and tuning the prompt** (calls the real Gemini API, so it needs `GEMINI_API_KEY`):

```bash
npm run chatbot:eval                              # all cases once
npm run chatbot:eval -- --runs 3                  # repeat each case to find flaky answers
npm run chatbot:eval -- --cat off-topic           # one category (in-scope, language, not-available, off-topic, security, sensitive)
npm run chatbot:eval -- --id na-like --verbose    # one case, show the reply
npm run chatbot:eval -- --system other-prompt.txt # A/B test a different system prompt
```

`npm test` never calls Gemini (a fake client is used), so it runs without a key.

**Which model works right now?** `npm run chatbot:models` tests every flash model of your key with one tiny question and prints
which ones answer and how fast, plus the `GEMINI_MODEL=` line to put in `.env`.

**Notes**

- Do not lower the temperature. Google recommends the default (1.0) for all Gemini 3 models and warns that lower
  values can cause looping. Consistency comes from the prompt and the examples instead.
- Chat history sent by the browser is treated as untrusted. It can only contain `user` / `model` text and is never
  placed in the system instruction.
- Without `GEMINI_API_KEY` or when Gemini fails, the endpoint returns a generic 503 and logs the real error on the server.
