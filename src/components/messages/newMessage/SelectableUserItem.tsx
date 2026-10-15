import type { MessageUser } from "../../../types/messages"
import Avatar from "../../common/Avatar"

interface Props {
  user: MessageUser
  selected: boolean
  onToggle: (userId: string) => void
}

/** A user row with a checkbox, used when picking group members. */
export default function SelectableUserItem({ user, selected, onToggle }: Props) {
  return (
    <div
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      onClick={() => onToggle(user.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onToggle(user.id)
        }
      }}
      className={`p-2 rounded-xl flex items-center justify-between border cursor-pointer transition ${
        selected
          ? "bg-purple-50/70 border-purple-300 shadow-xs"
          : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar
          src={user.avatar}
          alt={user.name}
          size="compact"
          className="border border-slate-200 shrink-0"
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
          <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
        </div>
      </div>

      <div
        className={`w-5 h-5 rounded-md flex items-center justify-center transition border ${
          selected ? "bg-purple-600 border-purple-600 text-white" : "border-slate-300 bg-white"
        }`}
      >
        {selected && (
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
    </div>
  )
}
