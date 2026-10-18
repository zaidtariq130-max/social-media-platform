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
  utils/        tokens, logger, AppError, id helpers
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
| GET/POST | `/api/conversations`, `/api/conversations/group` | |
| PUT | `/api/conversations/:id/accept`, `/clear`, `/block` | `clear` hides history for *you only* |
| DELETE | `/api/conversations/:id` | removes the chat **for both users** |
| GET/POST/DELETE | `/api/conversations/:id/messages[/:messageId]` | `DELETE` = for everyone |
| PUT | `/api/conversations/:id/messages/:messageId/delete-for-me` | |

## Notes

- **Unique indexes:** `username` (case-insensitive) and `directKey` (one 1-to-1 chat per pair of
  users) are enforced by MongoDB. If your database already contains duplicate usernames, MongoDB
  cannot build the username index until they are renamed.
- **CSRF:** `/auth/refresh` and `/auth/logout` reject requests whose `Origin` header is not
  `CLIENT_URL`.
- **Presence** is kept in memory. Running several server instances needs the Socket.io Redis adapter.
