import { useState, useEffect, useRef } from "react"
import type { Conversation, FolderType, MessageUser } from "../types/messages"
import { CURRENT_USER } from "../components/messages/initialData"
import ChatList from "../components/messages/ChatList"
import ChatWindow from "../components/messages/ChatWindow"
import NewMessageModal from "../components/messages/NewMessageModal"
import ChatInfoDrawer from "../components/messages/ChatInfoDrawer"
import api from "../api/axios"
import { useConversations } from "../hooks/useConversations"
import { mapConversation } from "../services/conversationService"
import Toast from "../components/messages/Toast"
import ConfirmDialog, { type ConfirmDialogState } from "../components/messages/ConfirmDialog"
import MessageDeleteDialog, {
  type MessageDeleteTarget,
} from "../components/messages/MessageDeleteDialog"
import { useToast } from "../hooks/useToast"
import { getStoredUser } from "../utils/currentUser"
import { getErrorMessage } from "../utils/errors"

export default function Messages() {
  const [activeFolder, setActiveFolder] = useState<FolderType>("primary")
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  // User chosen from "New message" but no message sent yet (chat is created on first send)
  const [draftUser, setDraftUser] = useState<MessageUser | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>(() => getStoredUser()?.id || "")

  // Conversation list: loaded once over REST, then kept live by Socket.io
  const { conversations, setConversations, isLoaded, isTypingIn, sendMessage, emitTyping } =
    useConversations({ currentUserId, activeConversationId })

  // Open the most recent conversation once, after the first load
  const hasAutoSelected = useRef(false)
  useEffect(() => {
    if (!isLoaded || hasAutoSelected.current) return
    hasAutoSelected.current = true
    const firstVisible = conversations.find((c) => c.messages?.length)
    if (firstVisible) setActiveConversationId(firstVisible.id)
  }, [isLoaded, conversations])

  // If the open conversation disappears (deleted by the other user, declined...), close it
  useEffect(() => {
    if (!isLoaded || !activeConversationId) return
    if (!conversations.some((c) => c.id === activeConversationId)) {
      setActiveConversationId(null)
      setIsMobileChatOpen(false)
    }
  }, [isLoaded, conversations, activeConversationId])

  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false)
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false)
  const [currentUsername, setCurrentUsername] = useState<string>(
    () => getStoredUser()?.username || "you"
  )
  const { toastMessage, showToast, hideToast } = useToast()
  const [deleteConfirm, setDeleteConfirm] = useState<ConfirmDialogState | null>(null)
  const [messageDeleteTarget, setMessageDeleteTarget] = useState<MessageDeleteTarget | null>(null)

  // Mobile navigation: whether chat view is open instead of list view
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false)

  // Track participant user IDs whose chats were cleared locally.
  // These contacts are still saved in the DB — we just hide the conversation from the sidebar.
  // Used to show "Message" instead of "Request" in the New Message modal.
  const [clearedContactIds, setClearedContactIds] = useState<Set<string>>(() => new Set())

  // Clear/remove hides the details panel visually (no conversation) but used to
  // leave it "open". The next new request/chat then showed delete-contact by itself.
  useEffect(() => {
    setIsInfoDrawerOpen(false)
  }, [activeConversationId, draftUser?.id])

  // Fetch logged in profile if backend is alive
  useEffect(() => {
    api
      .get("/auth/profile")
      .then((res) => {
        if (res.data?.user?.username) {
          setCurrentUsername(res.data.user.username)
        }
        const uid = res.data?.user?.id || res.data?.user?._id
        if (uid) {
          setCurrentUserId(String(uid))
        }
      })
      .catch(() => {
        // Fallback gracefully
        setCurrentUsername("you")
      })
  }, [])

  /** Fire-and-forget save to the server. The UI is already updated, so just warn if it failed. */
  function persist(request: Promise<unknown>) {
    request.catch(() => showToast("Couldn't save that change. Please check your connection."))
  }

  // Active conversation object
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null

  // Empty chat shown for a chosen user until the first message is sent
  const draftConversation: Conversation | null = draftUser
    ? {
        id: `draft_${draftUser.id}`,
        participant: draftUser,
        folder: "primary",
        requestStatus: "accepted",
        isBlocked: false,
        isMuted: false,
        unreadCount: 0,
        lastMessage: "",
        lastMessageTime: "",
        createdAt: Date.now(),
        messages: [],
      }
    : null

  // Handle select conversation (unread count is cleared by useConversations once it is open)
  function handleSelectConversation(id: string) {
    setDraftUser(null)
    setActiveConversationId(id)
    setIsMobileChatOpen(true)
  }

  // Send message (optimistic UI + Socket.io; see useConversations)
  async function handleSendMessage(text: string) {
    if (draftUser) return handleSendFirstMessage(draftUser, text)
    if (!activeConversationId) return
    const result = await sendMessage(activeConversationId, text)
    if (!result.ok) showToast(result.error)
  }

  // First message to a new/restored user.
  // If the conversation already exists in DB (e.g. after "Clear Chat"), it is restored
  // from the backend and no new request is needed — the existing requestStatus is reused.
  async function handleSendFirstMessage(user: MessageUser, text: string) {
    try {
      const res = await api.post("/conversations", { participantId: user.id })
      const conv = res.data.conversation
      const newId: string = conv.id
      const requestStatus =
        conv.requestStatus === "accepted" || clearedContactIds.has(user.id)
          ? "accepted"
          : (conv.requestStatus ?? "pending")
      const requestedBy = conv.requestedBy ?? currentUserId

      // Determine correct folder for sender
      const folder =
        requestStatus === "accepted" || String(requestedBy) === String(currentUserId)
          ? "primary"
          : "requests"

      setConversations((prev) => {
        // If the conversation was hidden (cleared) but already exists in local state, restore it
        const alreadyPresent = prev.some((c) => c.id === newId)
        if (alreadyPresent) return prev

        // Re-add the conversation (restored from backend after clear, or brand new)
        return [
          {
            id: newId,
            participant: conv.participant || user,
            folder,
            requestStatus,
            requestedBy,
            isBlocked: false,
            isMuted: false,
            unreadCount: 0,
            lastMessage: "",
            lastMessageTime: "",
            createdAt: Date.now(),
            messages: [],
          },
          ...prev,
        ]
      })

      // Conversation is now visible again — remove from cleared set
      setClearedContactIds((prev) => {
        const next = new Set(prev)
        next.delete(user.id)
        return next
      })

      setDraftUser(null)
      setActiveFolder("primary")
      setActiveConversationId(newId)
      setIsMobileChatOpen(true)

      const result = await sendMessage(newId, text)
      if (!result.ok) showToast(result.error)
    } catch {
      showToast("Failed to send message. Is the backend running?")
    }
  }

  // Send quick heart
  function handleSendHeart() {
    handleSendMessage("❤️")
  }

  // Accept Instagram Message Request
  function handleAcceptRequest(conversationId: string) {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            folder: "primary",
            requestStatus: "accepted",
            unreadCount: 0,
          }
        }
        return conv
      })
    )
    setActiveFolder("primary")
    showToast("Message request accepted! Moved to Primary inbox.")

    // Persist to backend
    persist(api.put(`/conversations/${conversationId}/accept`))
  }

  // Decline / Delete Instagram Message Request
  function handleDeclineRequest(conversationId: string) {
    const conv = conversations.find((c) => c.id === conversationId)
    const targetName = conv?.participant.name || conv?.participant.username || "this request"

    setDeleteConfirm({
      title: "Delete Message Request?",
      description: `Are you sure you want to delete the message request from ${targetName}?`,
      confirmText: "Yes, Delete",
      cancelText: "No, Cancel",
      onConfirm: () => {
        setConversations((prev) => prev.filter((c) => c.id !== conversationId))
        if (activeConversationId === conversationId) {
          setActiveConversationId(null)
          setIsMobileChatOpen(false)
        }
        setDeleteConfirm(null)
        showToast("Message request deleted.")

        // Persist so it doesn't come back on refresh
        persist(api.delete(`/conversations/${conversationId}`))
      },
    })
  }

  // Block / Unblock User
  function handleToggleBlockUser(conversationId: string) {
    const target = conversations.find((c) => c.id === conversationId)
    if (!target) return
    const nextState = !target.isBlocked

    setConversations((prev) =>
      prev.map((conv) => (conv.id === conversationId ? { ...conv, isBlocked: nextState } : conv))
    )
    showToast(
      nextState ? `Blocked @${target.participant.username}` : `Unblocked @${target.participant.username}`
    )

    // Persist block state to database
    persist(api.put(`/conversations/${conversationId}/block`))
  }

  // Remove contact permanently from list
  function handleDeleteConversation(conversationId: string) {
    const conv = conversations.find((c) => c.id === conversationId)
    const username = conv?.participant?.username || "this user"

    setDeleteConfirm({
      title: "Remove Contact Permanently?",
      description: `This permanently deletes your whole chat with @${username} for BOTH of you, and removes the contact. Use "Clear Chat" instead if you only want to hide the messages for yourself. To talk again later you will need to send a new message request.`,
      confirmText: "Yes, Remove Contact",
      cancelText: "No, Cancel",
      onConfirm: () => {
        setConversations((prev) => prev.filter((c) => c.id !== conversationId))
        if (activeConversationId === conversationId) {
          setActiveConversationId(null)
          setIsMobileChatOpen(false)
        }
        setDeleteConfirm(null)
        showToast(`@${username} removed from contacts.`)

        // Persist permanent removal to backend
        persist(api.delete(`/conversations/${conversationId}`))
      },
    })
  }

  // Clear chat: hide history and remove the thread from the left list.
  // Contact stays saved — New Message still shows "Message", not "Request".
  function handleClearMessages(conversationId: string) {
    const conv = conversations.find((c) => c.id === conversationId)
    const username = conv?.participant?.username || "this user"
    const participantId = conv?.participant?.id

    setDeleteConfirm({
      title: "Clear Chat?",
      description: `All messages with @${username} will be removed from your view. The contact stays saved — you can message them again anytime without a new request.`,
      confirmText: "Yes, Clear Chat",
      cancelText: "No, Cancel",
      onConfirm: () => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [],
                  lastMessage: "",
                  lastMessageTime: "",
                  unreadCount: 0,
                  requestStatus: "accepted",
                  folder: c.isBlocked ? "blocked" : "primary",
                }
              : c
          )
        )
        // Hide from the left list / DP strip. User can message again from
        // "Start a new conversation" — still a Message, not a Request.
        if (activeConversationId === conversationId) {
          setActiveConversationId(null)
          setIsMobileChatOpen(false)
        }
        setActiveFolder("primary")
        if (participantId) {
          setClearedContactIds((prev) => new Set([...prev, participantId]))
        }
        setDeleteConfirm(null)
        showToast("Chat cleared. Use New Message to chat again.")

        persist(api.put(`/conversations/${conversationId}/clear`))
      },
    })
  }

  // Toggle Mute
  function handleToggleMute(conversationId: string) {
    const target = conversations.find((c) => c.id === conversationId)
    if (!target) return
    const nextState = !target.isMuted

    setConversations((prev) =>
      prev.map((conv) => (conv.id === conversationId ? { ...conv, isMuted: nextState } : conv))
    )
    showToast(nextState ? "Notifications muted" : "Notifications unmuted")
  }

  // Delete Single Message: Opens WhatsApp-style choice modal
  function handleDeleteSingleMessage(
    conversationId: string,
    messageId: string
  ) {
    const conv = conversations.find((c) => c.id === conversationId)
    const msg = conv?.messages.find((m) => m.id === messageId)
    const isMyMessage = Boolean(
      msg && currentUserId && String(msg.senderId) === String(currentUserId)
    )

    setMessageDeleteTarget({
      conversationId,
      messageId,
      isMyMessage,
    })
  }

  // Delete for Everyone (Permanently deletes from database and both screens)
  function handleConfirmDeleteForEveryone(
    conversationId: string,
    messageId: string
  ) {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const remaining = conv.messages.filter((m) => m.id !== messageId)
          const last = remaining[remaining.length - 1]
          return {
            ...conv,
            messages: remaining,
            lastMessage: last ? last.text : "",
            lastMessageTime: last ? last.timestamp : "",
          }
        }
        return conv
      })
    )
    setMessageDeleteTarget(null)
    showToast("Message deleted for everyone.")

    // Persist to backend
    if (!messageId.startsWith("msg_")) {
      persist(api.delete(`/conversations/${conversationId}/messages/${messageId}`))
    }
  }

  // Delete for Me (Removes from current user's screen only)
  function handleConfirmDeleteForMe(
    conversationId: string,
    messageId: string
  ) {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const remaining = conv.messages.filter((m) => m.id !== messageId)
          const last = remaining[remaining.length - 1]
          return {
            ...conv,
            messages: remaining,
            lastMessage: last ? last.text : "",
            lastMessageTime: last ? last.timestamp : "",
          }
        }
        return conv
      })
    )
    setMessageDeleteTarget(null)
    showToast("Message deleted for you.")

    // Persist Delete for Me to backend so polling never restores it
    if (!messageId.startsWith("msg_")) {
      persist(api.put(`/conversations/${conversationId}/messages/${messageId}/delete-for-me`))
    }
  }

  // Toggle reaction (Heart)
  function handleToggleMessageReaction(
    conversationId: string,
    messageId: string,
    emoji: string
  ) {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const updatedMessages = conv.messages.map((m) => {
            if (m.id === messageId) {
              const reactions = m.reactions || []
              const hasEmoji = reactions.includes(emoji)
              return {
                ...m,
                reactions: hasEmoji
                  ? reactions.filter((r) => r !== emoji)
                  : [...reactions, emoji],
              }
            }
            return m
          })
          return {
            ...conv,
            messages: updatedMessages,
          }
        }
        return conv
      })
    )
  }

  // Send message request to user
  function handleSendRequest(user: MessageUser) {
    const existing = conversations.find(
      (c) =>
        !c.isGroup &&
        (String(c.participant.id) === String(user.id) ||
          c.participant.username.toLowerCase() === user.username.toLowerCase())
    )

    if (existing) {
      const isSavedContact =
        existing.requestStatus === "accepted" || clearedContactIds.has(existing.participant.id)
      setDraftUser(null)
      setActiveFolder(isSavedContact ? "primary" : existing.folder)
      setActiveConversationId(existing.id)
      setIsMobileChatOpen(true)
      showToast(
        existing.requestStatus === "pending" && !isSavedContact
          ? `Request already sent to @${user.username}`
          : `Opened chat with @${user.username}`
      )
      return
    }

    // Saved contact whose thread was hidden: still a Message, not a Request
    const saved = clearedContactIds.has(user.id)
    setDraftUser({ ...user })
    setActiveConversationId(null)
    setActiveFolder("primary")
    setIsMobileChatOpen(true)
    if (saved) showToast(`Message @${user.username}`)
  }

  // Create a new group conversation
  async function handleCreateGroup(name: string, participantIds: string[]) {
    try {
      const res = await api.post("/conversations/group", { name, participantIds })
      if (res.data.conversation) {
        const conv = mapConversation(res.data.conversation)
        setConversations((prev) => [conv, ...prev])
        setDraftUser(null)
        setActiveFolder("primary")
        setActiveConversationId(conv.id)
        setIsMobileChatOpen(true)
        showToast(`Group "${conv.groupName}" created!`)
      }
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to create group."))
    }
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100dvh-5.5rem)] sm:h-[calc(100dvh-6.5rem)] lg:h-[calc(100dvh-8rem)] w-full flex flex-col relative">
      <Toast message={toastMessage} onDismiss={hideToast} />

      {/* Main Messages Frame Container */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-[320px_1fr] lg:grid-cols-[360px_1fr]">
        {/* Left Column: Chat List */}
        <div
          className={`h-full min-h-0 flex flex-col overflow-hidden ${
            isMobileChatOpen ? "hidden md:flex" : "flex"
          }`}
        >
          <ChatList
            conversations={conversations}
            activeConversationId={activeConversationId}
            activeFolder={activeFolder}
            currentUsername={currentUsername}
            onSelectConversation={handleSelectConversation}
            onChangeFolder={setActiveFolder}
            onOpenNewMessageModal={() => setIsNewMessageModalOpen(true)}
            onToggleBlockUser={handleToggleBlockUser}
          />
        </div>

        {/* Right Column: Chat Window */}
        <div
          className={`h-full min-h-0 flex flex-col overflow-hidden ${
            !isMobileChatOpen ? "hidden md:flex" : "flex"
          }`}
        >
          <ChatWindow
            conversation={activeConversation ?? draftConversation}
            currentUserId={currentUserId || CURRENT_USER.id}
            isTyping={isTypingIn(activeConversationId)}
            onSendMessage={handleSendMessage}
            onSendHeart={handleSendHeart}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
            onToggleBlockUser={handleToggleBlockUser}
            onDeleteConversation={handleDeleteConversation}
            onClearMessages={handleClearMessages}
            onToggleMute={handleToggleMute}
            onDeleteSingleMessage={handleDeleteSingleMessage}
            onToggleMessageReaction={handleToggleMessageReaction}
            onBackToList={() => setIsMobileChatOpen(false)}
            onToggleInfoDrawer={() => {
              if (!activeConversation) return
              setIsInfoDrawerOpen((open) => !open)
            }}
            onTyping={(cid, typing) => {
              if (!cid.startsWith("draft_")) emitTyping(cid, typing)
            }}
          />
        </div>
      </div>

      {/* New Message / Add User Modal */}
      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
        conversations={conversations}
        clearedContactIds={clearedContactIds}
        onSendRequest={handleSendRequest}
        onCreateGroup={handleCreateGroup}
      />

      {/* Chat Info Drawer */}
      <ChatInfoDrawer
        conversation={activeConversation}
        isOpen={isInfoDrawerOpen}
        onClose={() => setIsInfoDrawerOpen(false)}
        onToggleBlockUser={handleToggleBlockUser}
        onToggleMute={handleToggleMute}
        onDeleteConversation={handleDeleteConversation}
        onClearMessages={handleClearMessages}
      />

      <ConfirmDialog dialog={deleteConfirm} onClose={() => setDeleteConfirm(null)} />

      <MessageDeleteDialog
        target={messageDeleteTarget}
        onDeleteForEveryone={handleConfirmDeleteForEveryone}
        onDeleteForMe={handleConfirmDeleteForMe}
        onClose={() => setMessageDeleteTarget(null)}
      />
    </div>
  )
}
