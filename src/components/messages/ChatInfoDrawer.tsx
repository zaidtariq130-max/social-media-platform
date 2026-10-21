import { useEffect } from "react"
import type { Conversation } from "../../types/messages"
import { colors } from "../../theme"
import Avatar from "../common/Avatar"
import IconButton from "../common/IconButton"
import { CloseIcon, BellSlashIcon, ShieldBanIcon, TrashIcon } from "../icons"
import { CheckCircleIcon } from "./MessageIcons"

interface Props {
  conversation: Conversation | null | undefined
  isOpen: boolean
  onClose: () => void
  onToggleBlockUser: (conversationId: string) => void
  onToggleMute: (conversationId: string) => void
  onClearMessages: (conversationId: string) => void
}

export default function ChatInfoDrawer({
  conversation,
  isOpen,
  onClose,
  onToggleBlockUser,
  onToggleMute,
  onClearMessages,
}: Props) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  if (!isOpen || !conversation) return null

  const { id, participant, isGroup, groupName, isBlocked, isMuted } = conversation
  const title = isGroup ? groupName || participant.name : participant.name

  const action =
    "w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 hover:bg-slate-100 transition cursor-pointer"

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onClick={onClose}>
      <aside
        className="w-full max-w-sm h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200"
        style={{ backgroundColor: colors.cardBackground, color: colors.text }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: colors.border }}>
          <h3 className="font-bold">Details</h3>
          <IconButton onClick={onClose} title="Close">
            <CloseIcon className="w-5 h-5" />
          </IconButton>
        </div>

        <div className="p-6 flex flex-col items-center text-center gap-2">
          <Avatar src={participant.avatar} alt={title} size="xl" isOnline={isGroup ? undefined : participant.isOnline} />
          <div className="flex items-center gap-1 font-bold text-lg">
            {title}
            {participant.isVerified && <CheckCircleIcon className="w-4 h-4 text-blue-500" />}
          </div>
          {!isGroup && (
            <p className="text-sm" style={{ color: colors.mutedText }}>@{participant.username}</p>
          )}
          {participant.bio && <p className="text-sm">{participant.bio}</p>}
          {!isGroup && (participant.followersCount !== undefined || participant.postsCount !== undefined) && (
            <div className="flex gap-6 mt-2 text-sm">
              <div><b>{participant.postsCount ?? 0}</b> posts</div>
              <div><b>{participant.followersCount ?? 0}</b> followers</div>
            </div>
          )}
        </div>

        <div className="px-3 pb-6 space-y-1">
          <button type="button" className={action} onClick={() => onToggleMute(id)}>
            <BellSlashIcon className="w-4 h-4" />
            {isMuted ? "Unmute notifications" : "Mute notifications"}
          </button>
          <button type="button" className={action} onClick={() => onClearMessages(id)}>
            <TrashIcon className="w-4 h-4" />
            Clear chat
          </button>
          {!isGroup && (
            <button type="button" className={`${action} text-rose-600`} onClick={() => onToggleBlockUser(id)}>
              <ShieldBanIcon className="w-4 h-4" />
              {isBlocked ? "Unblock" : "Block"} @{participant.username}
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}
