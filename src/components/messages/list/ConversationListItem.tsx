import type { Conversation } from "../../../types/messages"
import { colors } from "../../../theme"
import { formatListTime } from "../../../utils/time"
import Avatar from "../../common/Avatar"
import Badge from "../../common/Badge"
import { BellSlashIcon, CheckCircleIcon } from "../MessageIcons"

interface Props {
  conversation: Conversation
  isSelected: boolean
  onSelect: (id: string) => void
  onToggleBlockUser?: (conversationId: string) => void
}

function Preview({ conversation, isUnread }: { conversation: Conversation; isUnread: boolean }) {
  const hasMessages = conversation.messages && conversation.messages.length > 0

  return (
    <p className={`text-xs truncate ${isUnread ? "font-semibold text-slate-900" : "text-slate-500"}`}>
      {hasMessages ? (
        conversation.lastMessage || "No messages yet"
      ) : (
        <span className="text-blue-600 font-medium text-[11px] inline-flex items-center gap-1">
          <span>✨</span> Start a new conversation
        </span>
      )}
    </p>
  )
}

export default function ConversationListItem({
  conversation,
  isSelected,
  onSelect,
  onToggleBlockUser,
}: Props) {
  const { id, participant, isBlocked, isGroup, isMuted, messages } = conversation
  const isUnread = conversation.unreadCount > 0

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect(id)
        }
      }}
      className={`p-3.5 flex items-center gap-3 transition cursor-pointer hover:bg-slate-50 relative ${
        isSelected ? "bg-blue-50/70" : ""
      }`}
    >
      <Avatar src={participant.avatar} alt={participant.name} size="lg" isOnline={participant.isOnline} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5 truncate">
            <span
              className={`text-sm truncate ${
                isUnread ? "font-bold text-slate-900" : "font-medium text-slate-800"
              }`}
            >
              {participant.name}
            </span>
            {isGroup && (
              <Badge tone="purpleSoft" className="shrink-0 font-semibold">
                Group
              </Badge>
            )}
            {participant.isVerified && (
              <CheckCircleIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            )}
          </div>
          <span className="text-[11px] text-slate-400 shrink-0 ml-2">
            {messages && messages.length > 0 ? formatListTime(conversation.lastMessageTime) : ""}
          </span>
        </div>

        <div className="flex items-center justify-between">
          {isBlocked ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
                🚫 Blocked
              </span>
              {onToggleBlockUser && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleBlockUser(id)
                  }}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  Unblock
                </button>
              )}
            </div>
          ) : (
            <Preview conversation={conversation} isUnread={isUnread} />
          )}

          <div className="flex items-center gap-1 shrink-0 ml-2">
            {isMuted && <BellSlashIcon className="w-3 h-3 text-slate-400" />}
            {isUnread && <span className="w-2 h-2 rounded-full bg-blue-600" />}
          </div>
        </div>
      </div>

      {isSelected && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: colors.primary }}
        />
      )}
    </div>
  )
}
