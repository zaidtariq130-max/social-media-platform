import { useMemo, useState } from "react"
import type { Conversation, FolderType, MessageUser } from "../../types/messages"
import { colors } from "../../theme"
import {
  countBlocked,
  countPendingRequests,
  countUnreadInGroups,
  filterConversations,
  getOnlineContacts,
} from "../../utils/conversationFilters"
import SearchInput from "../common/SearchInput"
import ChatListHeader from "./list/ChatListHeader"
import ActiveContactsStrip from "./list/ActiveContactsStrip"
import FolderTabs from "./list/FolderTabs"
import ConversationListItem from "./list/ConversationListItem"
import ConversationListEmpty from "./list/ConversationListEmpty"

interface ChatListProps {
  conversations: Conversation[]
  activeConversationId: string | null
  activeFolder: FolderType
  currentUsername: string
  onSelectConversation: (id: string) => void
  onChangeFolder: (folder: FolderType) => void
  onOpenNewMessageModal: () => void
  onToggleBlockUser?: (conversationId: string) => void
}

export default function ChatList({
  conversations,
  activeConversationId,
  activeFolder,
  currentUsername,
  onSelectConversation,
  onChangeFolder,
  onOpenNewMessageModal,
  onToggleBlockUser,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const pendingRequestsCount = useMemo(() => countPendingRequests(conversations), [conversations])
  const blockedUsersCount = useMemo(() => countBlocked(conversations), [conversations])
  const unreadGroupsCount = useMemo(() => countUnreadInGroups(conversations), [conversations])
  const onlineContacts = useMemo(() => getOnlineContacts(conversations), [conversations])
  const filtered = useMemo(
    () => filterConversations(conversations, activeFolder, searchQuery),
    [conversations, activeFolder, searchQuery]
  )

  function handleSelectContact(contact: MessageUser) {
    const conv = conversations.find((c) => c.participant.id === contact.id)
    if (!conv) return
    onChangeFolder(conv.folder)
    onSelectConversation(conv.id)
  }

  return (
    <div
      className="flex flex-col h-full min-h-0 border-r select-none"
      style={{ backgroundColor: colors.cardBackground, borderColor: colors.border }}
    >
      <ChatListHeader
        currentUsername={currentUsername}
        onOpenNewMessageModal={onOpenNewMessageModal}
      />

      <div className="p-2.5 sm:p-3 shrink-0">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search chats or users..."
        />
      </div>

      {onlineContacts.length > 0 && !searchQuery && (
        <ActiveContactsStrip contacts={onlineContacts} onSelectContact={handleSelectContact} />
      )}

      <FolderTabs
        activeFolder={activeFolder}
        onChangeFolder={onChangeFolder}
        blockedCount={blockedUsersCount}
        requestsCount={pendingRequestsCount}
        unreadGroupsCount={unreadGroupsCount}
      />

      <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 chat-scroll">
        {filtered.length === 0 ? (
          <ConversationListEmpty
            activeFolder={activeFolder}
            searchQuery={searchQuery}
            onOpenNewMessageModal={onOpenNewMessageModal}
          />
        ) : (
          filtered.map((conv) => (
            <ConversationListItem
              key={conv.id}
              conversation={conv}
              isSelected={conv.id === activeConversationId}
              onSelect={onSelectConversation}
              onToggleBlockUser={onToggleBlockUser}
            />
          ))
        )}
      </div>
    </div>
  )
}
