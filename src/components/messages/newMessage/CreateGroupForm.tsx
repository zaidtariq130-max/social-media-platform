import { useState, type FormEvent } from "react"
import type { MessageUser } from "../../../types/messages"
import SearchInput from "../../common/SearchInput"
import SelectableUserItem from "./SelectableUserItem"

interface Props {
  users: MessageUser[]
  loading: boolean
  onSubmit: (name: string, participantIds: string[]) => Promise<void> | void
  onCancel: () => void
}

export default function CreateGroupForm({ users, loading, onSubmit, onCancel }: Props) {
  const [groupName, setGroupName] = useState("")
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const q = search.toLowerCase()
  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
  )
  const canSubmit = groupName.trim().length > 0 && selectedIds.length > 0 && !isCreating

  function toggle(userId: string) {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setIsCreating(true)
    try {
      await onSubmit(groupName.trim(), selectedIds)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-1">
      <div>
        <label htmlFor="group-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
          Group Name
        </label>
        <input
          id="group-name"
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="e.g. Design Team, Study Group..."
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
          required
          autoFocus
        />
      </div>

      <div>
        <p className="block text-xs font-semibold text-slate-700 mb-1.5">
          Select Members ({selectedIds.length} selected)
        </p>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search people to add..."
          accent="purple"
          className="mb-2"
        />

        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {loading ? (
            <div className="p-4 text-center text-xs text-slate-400 animate-pulse">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">No users found.</div>
          ) : (
            filtered.map((user) => (
              <SelectableUserItem
                key={user.id}
                user={user}
                selected={selectedIds.includes(user.id)}
                onToggle={toggle}
              />
            ))
          )}
        </div>
      </div>

      <div className="pt-3 flex items-center justify-between border-t border-slate-100">
        <span className="text-xs text-slate-500 font-medium">
          {selectedIds.length} participant{selectedIds.length === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition bg-purple-600 hover:bg-purple-700 active:scale-95"
          >
            {isCreating ? "Creating..." : `Create Group (${selectedIds.length})`}
          </button>
        </div>
      </div>
    </form>
  )
}
