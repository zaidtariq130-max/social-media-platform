import type { ReactNode } from "react"
import type { MessageUser } from "../../types/messages"
import { colors } from "../../theme"
import Avatar from "../common/Avatar"

interface UserRowProps {
  user: MessageUser
  /** Buttons shown on the right (Add friend, Accept, Decline...). */
  actions?: ReactNode
}

/** One user line: avatar, name, @username and action buttons. */
export default function UserRow({ user, actions }: UserRowProps) {
  return (
    <li
      className="flex items-center gap-3 p-3 rounded-2xl border"
      style={{ backgroundColor: colors.cardBackground, borderColor: colors.border }}
    >
      <Avatar src={user.avatar} alt={user.name} size="row" />

      <div className="min-w-0 flex-1">
        <p className="font-semibold truncate" style={{ color: colors.text }}>
          {user.name}
        </p>
        <p className="text-xs truncate" style={{ color: colors.mutedText }}>
          @{user.username}
        </p>
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </li>
  )
}
