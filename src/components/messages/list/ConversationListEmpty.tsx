import type { FolderType } from "../../../types/messages"

interface Props {
  activeFolder: FolderType
  searchQuery: string
  onOpenNewMessageModal: () => void
}

function headline(folder: FolderType, searchQuery: string): string {
  if (folder === "requests") return "No message requests right now"
  if (folder === "blocked") return "No blocked users"
  if (folder === "groups") return "No group chats yet"
  if (searchQuery) return `No chats found for "${searchQuery}"`
  return "No conversations in this tab"
}

export default function ConversationListEmpty({ activeFolder, searchQuery, onOpenNewMessageModal }: Props) {
  // Blocked tab: text only, no buttons
  if (activeFolder === "blocked") {
    return (
      <div className="p-8 text-center text-slate-400">
        <p className="text-xs sm:text-sm font-medium">No blocked users</p>
      </div>
    )
  }

  // Groups tab: show create group button
  if (activeFolder === "groups" && !searchQuery) {
    return (
      <div className="p-8 flex flex-col items-center gap-3 text-center">
        <div className="text-3xl">👥</div>
        <p className="text-xs sm:text-sm font-medium text-slate-500">No group chats yet</p>
        <button
          type="button"
          onClick={onOpenNewMessageModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>👥</span>
          <span>Create a group</span>
        </button>
      </div>
    )
  }

  // Primary tab with no chats at all: only the "Start a new conversation" button
  if (activeFolder === "primary" && !searchQuery) {
    return (
      <div className="p-8 flex justify-center">
        <button
          type="button"
          onClick={onOpenNewMessageModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>✨</span>
          <span>Start a new conversation</span>
        </button>
      </div>
    )
  }

  return (
    <div className="p-8 text-center text-slate-400 space-y-2">
      <div className="text-3xl">💬</div>
      <p className="text-xs sm:text-sm font-medium">{headline(activeFolder, searchQuery)}</p>

      {searchQuery ? (
        <div className="pt-2 space-y-2">
          <p className="text-[11px] text-slate-500">
            Not in current chats? Search the entire database to re-add them.
          </p>
          <button
            type="button"
            onClick={onOpenNewMessageModal}
            className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>🔍</span>
            <span>Search All Users</span>
          </button>
        </div>
      ) : activeFolder === "requests" ? (
        <p className="text-[11px] text-slate-400">
          Incoming messages from new users will show up here to accept or decline.
        </p>
      ) : (
        <button
          type="button"
          onClick={onOpenNewMessageModal}
          className="mt-2 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
        >
          + Send a new message
        </button>
      )}
    </div>
  )
}
