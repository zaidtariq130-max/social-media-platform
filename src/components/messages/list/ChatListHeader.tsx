import { colors } from "../../../theme"

interface Props {
  currentUsername: string
}

export default function ChatListHeader({ currentUsername }: Props) {
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
      </div>
    </div>
  )
}
