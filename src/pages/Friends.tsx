import { useState } from "react"
import { colors } from "../theme"
import { useFriends } from "../hooks/useFriends"
import { useToast } from "../hooks/useToast"
import Tabs, { type TabItem } from "../components/common/Tabs"
import SearchInput from "../components/common/SearchInput"
import Button from "../components/common/Button"
import Toast from "../components/messages/Toast"
import UserRow from "../components/friends/UserRow"
import PersonActions from "../components/friends/PersonActions"
import { CheckIcon, CloseIcon } from "../components/icons"

type FriendsTab = "people" | "requests" | "friends"

function EmptyState({ text }: { text: string }) {
  return (
    <p className="text-sm text-center py-10" style={{ color: colors.mutedText }}>
      {text}
    </p>
  )
}

export default function Friends() {
  const [tab, setTab] = useState<FriendsTab>("people")
  const [search, setSearch] = useState("")
  const { toastMessage, showToast, hideToast } = useToast(2500)

  const { people, incoming, outgoing, friends, loading, error, send, accept, decline, cancel, unfriend } =
    useFriends(search)

  /** Runs an action and shows its result as a small message. */
  const withToast =
    <A extends unknown[]>(action: (...args: A) => Promise<string>, success: string) =>
    async (...args: A) => {
      const failure = await action(...args)
      showToast(failure || success)
    }

  const onAdd = withToast(send, "Friend request sent")
  const onCancel = withToast(cancel, "Request cancelled")
  const onAccept = withToast(accept, "Friend request accepted")
  const onDecline = withToast(decline, "Friend request denied")
  const onUnfriend = withToast(unfriend, "Friend removed")

  const tabs: TabItem<FriendsTab>[] = [
    { id: "people", label: "People" },
    { id: "requests", label: "Requests", badge: { count: incoming.length, tone: "solidRose" } },
    { id: "friends", label: "Friends" },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-4 relative">
      <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: colors.text }}>
        Friends
      </h2>

      <Tabs items={tabs} active={tab} onChange={setTab} />

      {tab === "people" && (
        <SearchInput value={search} onChange={setSearch} placeholder="Search people by username" />
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm" style={{ color: colors.secondaryText }}>
          Loading...
        </p>
      ) : (
        <>
          {tab === "people" && (
            <ul className="space-y-2">
              {people.length === 0 && <EmptyState text="No users found." />}
              {people.map((person) => (
                <UserRow
                  key={person.id}
                  user={person}
                  actions={
                    <PersonActions
                      person={person}
                      onAdd={onAdd}
                      onCancel={onCancel}
                      onAccept={onAccept}
                      onDecline={onDecline}
                    />
                  }
                />
              ))}
            </ul>
          )}

          {tab === "requests" && (
            <div className="space-y-6">
              <section className="space-y-2">
                <h3 className="text-sm font-semibold" style={{ color: colors.secondaryText }}>
                  Received ({incoming.length})
                </h3>
                <ul className="space-y-2">
                  {incoming.length === 0 && <EmptyState text="No friend requests received." />}
                  {incoming.map((request) => (
                    <UserRow
                      key={request.id}
                      user={request.user}
                      actions={
                        <>
                          <Button onClick={() => onAccept(request.id)}>
                            <CheckIcon className="w-4 h-4" />
                            Accept
                          </Button>
                          <Button variant="outline" onClick={() => onDecline(request.id)}>
                            <CloseIcon className="w-4 h-4" />
                            Deny
                          </Button>
                        </>
                      }
                    />
                  ))}
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold" style={{ color: colors.secondaryText }}>
                  Sent ({outgoing.length})
                </h3>
                <ul className="space-y-2">
                  {outgoing.length === 0 && <EmptyState text="No pending requests sent." />}
                  {outgoing.map((request) => (
                    <UserRow
                      key={request.id}
                      user={request.user}
                      actions={
                        <Button variant="outline" onClick={() => onCancel(request.id)}>
                          Cancel request
                        </Button>
                      }
                    />
                  ))}
                </ul>
              </section>
            </div>
          )}

          {tab === "friends" && (
            <ul className="space-y-2">
              {friends.length === 0 && <EmptyState text="You have no friends yet." />}
              {friends.map((friend) => (
                <UserRow
                  key={friend.id}
                  user={friend}
                  actions={
                    <Button variant="outline" onClick={() => onUnfriend(friend.id)}>
                      Remove
                    </Button>
                  }
                />
              ))}
            </ul>
          )}
        </>
      )}

      <Toast message={toastMessage} onDismiss={hideToast} />
    </div>
  )
}
