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
import { TrashIcon } from "../components/icons"

interface DeleteConfirmState {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
}

interface MessageDeleteTarget {
  conversationId: string
  messageId: string
  isMyMessage: boolean
}

export default function Messages() {
  const [activeFolder, setActiveFolder] = useState<FolderType>("primary")
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  // User chosen from "New message" but no message sent yet (chat is created on first send)
  const [draftUser, setDraftUser] = useState<MessageUser | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const u = localStorage.getItem("current_user")
      if (u) return JSON.parse(u).id || ""
    } catch {}
    return ""
  })

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
  const [currentUsername, setCurrentUsername] = useState<string>(() => {
    try {
      const u = localStorage.getItem("current_user")
      if (u) return JSON.parse(u).username || "you"
    } catch {}
    return "you"
  })
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null)
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

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 1800)
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
    api.put(`/conversations/${conversationId}/accept`).catch(() => {})
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
        api.delete(`/conversations/${conversationId}`).catch(() => {})
      },
    })
  }

  // Block / Unblock User
  function handleToggleBlockUser(conversationId: string) {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const nextState = !conv.isBlocked
          showToast(
            nextState
              ? `Blocked @${conv.participant.username}`
              : `Unblocked @${conv.participant.username}`
          )
          return {
            ...conv,
            isBlocked: nextState,
          }
        }
        return conv
      })
    )

    // Persist block state to database
    api.put(`/conversations/${conversationId}/block`).catch(() => {})
  }

  // Remove contact permanently from list
  function handleDeleteConversation(conversationId: string) {
    const conv = conversations.find((c) => c.id === conversationId)
    const username = conv?.participant?.username || "this user"

    setDeleteConfirm({
      title: "Remove Contact Permanently?",
      description: `This will completely remove @${username} from your contacts list. If you want to chat again later, you will need to send a new message request.`,
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
        api.delete(`/conversations/${conversationId}`).catch(() => {})
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

        api.put(`/conversations/${conversationId}/clear`).catch(() => {})
      },
    })
  }

  // Toggle Mute
  function handleToggleMute(conversationId: string) {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const nextState = !conv.isMuted
          showToast(
            nextState ? "Notifications muted" : "Notifications unmuted"
          )
          return {
            ...conv,
            isMuted: nextState,
          }
        }
        return conv
      })
    )
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
      api
        .delete(`/conversations/${conversationId}/messages/${messageId}`)
        .catch(() => {})
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
      api
        .put(`/conversations/${conversationId}/messages/${messageId}/delete-for-me`)
        .catch(() => {})
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
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to create group.")
    }
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100dvh-5.5rem)] sm:h-[calc(100dvh-6.5rem)] lg:h-[calc(100dvh-8rem)] w-full flex flex-col relative">
      {/* Toast Alert: bottom-right corner of chat (Instantly disappears on mouse hover or click) */}
      {toastMessage && (
        <div
          onMouseEnter={() => setToastMessage(null)}
          onClick={() => setToastMessage(null)}
          className="fixed sm:absolute bottom-5 right-5 z-50 bg-slate-900/95 hover:bg-slate-800 text-white px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium shadow-2xl backdrop-blur-xs animate-in fade-in slide-in-from-bottom-2 duration-150 border border-slate-700/80 flex items-center gap-2.5 cursor-pointer select-none transition-all hover:scale-95 hover:opacity-0"
          title="Hover or click to dismiss immediately"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setToastMessage(null)
            }}
            className="ml-1 text-slate-400 hover:text-white text-xs px-1 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

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

      {/* Delete Confirmation Modal (Yes / No) */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <TrashIcon className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-base text-slate-900">
                {deleteConfirm.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {deleteConfirm.description}
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                No
              </button>

              <button
                type="button"
                onClick={deleteConfirm.onConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition cursor-pointer shadow-sm shadow-rose-600/20"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp-style Single Message Delete Choice Modal */}
      {messageDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <TrashIcon className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-base text-slate-900">
                Delete Message?
              </h3>
              <p className="text-xs text-slate-500">
                Choose how you want to delete this message.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {messageDeleteTarget.isMyMessage && (
                <button
                  type="button"
                  onClick={() =>
                    handleConfirmDeleteForEveryone(
                      messageDeleteTarget.conversationId,
                      messageDeleteTarget.messageId
                    )
                  }
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Delete for Everyone
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  handleConfirmDeleteForMe(
                    messageDeleteTarget.conversationId,
                    messageDeleteTarget.messageId
                  )
                }
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Delete for Me
              </button>

              <button
                type="button"
                onClick={() => setMessageDeleteTarget(null)}
                className="w-full py-2 px-4 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
