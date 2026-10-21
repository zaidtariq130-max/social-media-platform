import { useState } from "react"
import type { MessageUser } from "../../../types/messages"
import SearchInput from "../../common/SearchInput"
import UserListItem from "./UserListItem"
import UserListSkeleton from "./UserListSkeleton"

interface Props {
  users: MessageUser[]
  loading: boolean
  error: string
  onSelectUser: (user: MessageUser) => void
}

export default function SuggestedUsersTab({ users, loading, error, onSelectUser }: Props) {
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
          Your Friends
        </p>

        {loading ? (
          <UserListSkeleton />
        ) : error ? (
          <div className="p-6 text-center text-xs text-red-400">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            {search
              ? `No friends matching "${search}".`
              : "No friends yet. Add friends from the Friends page to start chatting."}
          </div>
        ) : (
          filtered.map((user) => (
            <UserListItem
              key={user.id}
              user={user}
              onAction={onSelectUser}
            />
          ))
        )}
      </div>
    </div>
  )
}
