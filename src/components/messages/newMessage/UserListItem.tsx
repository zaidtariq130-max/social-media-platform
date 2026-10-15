import type { MessageUser } from "../../../types/messages"
import { colors } from "../../../theme"
import Avatar from "../../common/Avatar"
import { CheckCircleIcon } from "../MessageIcons"

export type UserRelation = "none" | "pending" | "accepted"

interface Props {
  user: MessageUser
  relation: UserRelation
  onAction: (user: MessageUser) => void
}

function ActionButton({ relation, onClick }: { relation: UserRelation; onClick: () => void }) {
  if (relation === "pending") {
    return (
      <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-500 inline-block">
        Requested
      </span>
    )
  }

  if (relation === "accepted") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
      >
        Message
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white shadow-xs hover:opacity-90 active:scale-95 transition cursor-pointer"
      style={{ backgroundColor: colors.primary }}
    >
      Request
    </button>
  )
}

/** A user row with a context-aware action (Request / Requested / Message). */
export default function UserListItem({ user, relation, onAction }: Props) {
  return (
    <div className="p-2.5 rounded-2xl flex items-center justify-between border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 transition">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar
          src={user.avatar}
          alt={user.name}
          size="row"
          isOnline={user.isOnline}
          className="border border-slate-200"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">{user.name}</span>
            {user.isVerified && <CheckCircleIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
          </div>
          <span className="text-xs text-slate-500 block truncate">@{user.username}</span>
        </div>
      </div>

      <div className="shrink-0 ml-2">
        <ActionButton relation={relation} onClick={() => onAction(user)} />
      </div>
    </div>
  )
}
