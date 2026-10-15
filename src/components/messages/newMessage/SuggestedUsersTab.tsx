import { useState } from "react"
import type { Conversation, MessageUser } from "../../../types/messages"
import { findConversationWithUser } from "../../../utils/conversation"
import SearchInput from "../../common/SearchInput"
import UserListItem, { type UserRelation } from "./UserListItem"
import UserListSkeleton from "./UserListSkeleton"

interface Props {
  users: MessageUser[]
  loading: boolean
  error: string
  conversations: Conversation[]
  /** IDs of participants whose chats were cleared — treat as "accepted" so "Message" button shows */
  clearedContactIds?: Set<string>
  onSelectUser: (user: MessageUser) => void
}

function relationOf(
  conversations: Conversation[],
  user: MessageUser,
  clearedContactIds?: Set<string>
): UserRelation {
  // Chat was cleared — contact is still saved, show "Message" not "Request"
  if (user.id && clearedContactIds) {
    for (const id of clearedContactIds) {
      if (String(id) === String(user.id)) return "accepted"
    }
  }
  const existing = findConversationWithUser(conversations, user)
  const status = existing?.requestStatus
  if (status === "pending") return "pending"
  if (status === "accepted" || existing) return "accepted"
  return "none"
}

export default function SuggestedUsersTab({ users, loading, error, conversations, clearedContactIds, onSelectUser }: Props) {
  const [search, setSearch] = useState("")
  const q = search.toLowerCase()
  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
  )

  return (
    <div className="space-y-3">
      <SearchInput value={search} onChange={setSearch} placeholder="Search by name or @username..." />

      <div className="space-y-2 pt-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Suggested People
        </p>

        {loading ? (
          <UserListSkeleton />
        ) : error ? (
          <div className="p-6 text-center text-xs text-red-400">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            {search
              ? `No users matching "${search}". Try the "@username" tab.`
              : "No other users registered yet."}
          </div>
        ) : (
          filtered.map((user) => (
            <UserListItem
              key={user.id}
              user={user}
              relation={relationOf(conversations, user, clearedContactIds)}
              onAction={onSelectUser}
            />
          ))
        )}
      </div>
    </div>
  )
}
