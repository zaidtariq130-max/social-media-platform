import { useState } from "react"
import type { MessageUser } from "../../types/messages"
import { useUsers } from "../../hooks/useUsers"
import Modal from "../common/Modal"
import Badge from "../common/Badge"
import Tabs, { type TabItem } from "../common/Tabs"
import SuggestedUsersTab from "./newMessage/SuggestedUsersTab"
import AddByUsernameForm from "./newMessage/AddByUsernameForm"
import CreateGroupForm from "./newMessage/CreateGroupForm"
import { UserPlusIcon, UsersIcon } from "./MessageIcons"

interface NewMessageModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectUser: (user: MessageUser) => void
  onCreateGroup?: (name: string, participantIds: string[]) => Promise<void> | void
}

type ModalTab = "suggested" | "username" | "group"

export default function NewMessageModal({
  isOpen,
  onClose,
  onSelectUser,
  onCreateGroup,
}: NewMessageModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("suggested")
  const { users, loading, error } = useUsers(isOpen)

  if (!isOpen) return null

  const isGroupTab = activeTab === "group"

  function close() {
    setActiveTab("suggested")
    onClose()
  }

  function selectUserAndClose(user: MessageUser) {
    onSelectUser(user)
    // Unmount on the next tick so the click cannot fall through onto the
    // chat-info button sitting behind the modal.
    window.setTimeout(close, 0)
  }

  const tabs: TabItem<ModalTab>[] = [
    { id: "suggested", label: "Suggested" },
    { id: "username", label: "@username", icon: <UserPlusIcon className="w-3.5 h-3.5" /> },
    ...(onCreateGroup
      ? [
          {
            id: "group" as const,
            label: "Group Chat",
            accent: "purple" as const,
            icon: <UsersIcon className="w-3.5 h-3.5" />,
          },
        ]
      : []),
  ]

  return (
    <Modal
      title={isGroupTab ? "Create Group Chat" : "New Message"}
      badge={
        <Badge tone={isGroupTab ? "purple" : "blue"} size="md">
          {isGroupTab ? "Group" : "Direct"}
        </Badge>
      }
      onClose={close}
    >
      <Tabs items={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="flex-1 min-h-0 overflow-y-auto p-4 chat-scroll">
        {activeTab === "suggested" && (
          <SuggestedUsersTab
            users={users}
            loading={loading}
            error={error}
            onSelectUser={selectUserAndClose}
          />
        )}

        {activeTab === "username" && (
          <AddByUsernameForm onSubmit={selectUserAndClose} onCancel={close} />
        )}

        {activeTab === "group" && onCreateGroup && (
          <CreateGroupForm
            users={users}
            loading={loading}
            onSubmit={async (name, ids) => {
              await onCreateGroup(name, ids)
              close()
            }}
            onCancel={close}
          />
        )}
      </div>
    </Modal>
  )
}
