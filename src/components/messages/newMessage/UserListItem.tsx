import type { MessageUser } from "../../../types/messages"
import Avatar from "../../common/Avatar"
import { CheckCircleIcon } from "../MessageIcons"

interface Props {
  user: MessageUser
  onAction: (user: MessageUser) => void
}

/** A friend row with a "Message" button. */
export default function UserListItem({ user, onAction }: Props) {
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
        <button
          type="button"
          onClick={() => onAction(user)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
        >
          Message
        </button>
      </div>
    </div>
  )
}
