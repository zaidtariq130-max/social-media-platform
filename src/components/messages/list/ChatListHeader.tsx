import { colors } from "../../../theme"
import IconButton from "../../common/IconButton"
import Badge from "../../common/Badge"
import { UserPlusIcon } from "../MessageIcons"

interface Props {
  currentUsername: string
  onOpenNewMessageModal: () => void
}

export default function ChatListHeader({ currentUsername, onOpenNewMessageModal }: Props) {
  return (
    <div
      className="p-3 sm:p-4 border-b flex items-center justify-between shrink-0"
      style={{ borderColor: colors.border }}
    >
      <div
        className="flex items-center gap-1.5 font-bold text-base sm:text-lg"
        style={{ color: colors.text }}
      >
        <span>@{currentUsername || "you"}</span>
        <Badge size="md">Direct</Badge>
      </div>

      <IconButton
        onClick={onOpenNewMessageModal}
        title="New Message / Add User"
        className="flex items-center justify-center active:scale-95"
        style={{ color: colors.primary }}
      >
        <UserPlusIcon className="w-5 h-5" />
      </IconButton>
    </div>
  )
}
