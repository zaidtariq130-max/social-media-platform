# Social App – Frontend

React + TypeScript (Vite) app with REST (axios) and real-time chat (Socket.io).
The backend lives in `backend/` (see `backend/README.md`).

## Quick start

```bash
npm install
cp .env.example .env     # set VITE_API_URL if the backend is not on localhost:5000
npm run dev              # http://localhost:5173
```

Start the backend first, otherwise login and chat will not work.
Backend `CLIENT_URL` must match the address of this app.

## Folder structure (`src/`)

| Folder / file | What it is for |
| --- | --- |
| `main.tsx`, `App.tsx` | Entry point, routes, "is the user logged in?" check |
| `api/axios.ts` | axios instance, access token (kept in memory), automatic token refresh on 401 |
| `socket/socket.ts` | One shared Socket.io connection for the whole app |
| `config/app.ts` | App name and backend URL |
| `routes/` | `ProtectedRoute` (login required), `ProtectedLayout` (sidebar + header + socket connect) |
| `pages/` | Full screens: Home (posts), Messages (chat), Profile, Welcome, Login/Signup (`AuthPage`) |
| `components/auth/` | Login and signup forms |
| `components/common/` | Reusable UI: Button, Input, Modal, Tabs, Avatar, Badge, SearchInput, IconButton |
| `components/messages/` | Chat UI: list, window, info drawer, new message modal, dialogs, toast |
| `components/Sidebar.tsx`, `Header.tsx`, `PostCard.tsx` | Layout and post card |
| `hooks/` | `useConversations` (chat state + live updates), `useChatSocket` (socket events), `useToast`, `useUsers` |
| `services/` | API calls and mapping server data to UI types |
| `types/` | Shared TypeScript types (messages, socket events) |
| `utils/` | Small helpers (time, errors, avatar, conversation filters, current user) |
| `theme/` | Colors, spacing, typography, layout values |

## How things connect

1. `App.tsx` calls `bootstrapAuth()` which asks `/auth/refresh` (cookie) for an access token.
2. Pages talk to the API only through `api/axios.ts`; a 401 triggers one refresh, then retries.
3. `ProtectedLayout` opens the socket once; `useChatSocket` listens to events and
   `useConversations` keeps the chat list in sync.

## Rules of the project

- Use components from `components/common/` instead of writing new buttons/inputs.
- Colors and spacing come from `theme/`, not hard-coded values.
- Keep pages thin: logic goes into `hooks/` and `services/`.
- Formatting: `.editorconfig` and `.prettierrc` (LF line endings, 2 spaces).
