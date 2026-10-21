import { useCallback, useEffect, useState } from "react"
import type { Friend, FriendRequest, Person } from "../types/friends"
import {
  cancelFriendRequest,
  fetchFriends,
  fetchPeople,
  fetchRequests,
  removeFriend,
  respondToFriendRequest,
  sendFriendRequest,
} from "../services/friendService"
import { getErrorMessage } from "../utils/errors"
import { FRIENDS_CHANGED, useFriendEvents } from "./useFriendEvents"

/** Everything the Friends page needs: the lists plus the actions that change them. */
export function useFriends(search: string) {
  const [people, setPeople] = useState<Person[]>([])
  const [incoming, setIncoming] = useState<FriendRequest[]>([])
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const reload = useCallback(async () => {
    try {
      const [p, i, o, f] = await Promise.all([
        fetchPeople(search),
        fetchRequests("incoming"),
        fetchRequests("outgoing"),
        fetchFriends(),
      ])
      setPeople(p)
      setIncoming(i)
      setOutgoing(o)
      setFriends(f)
      setError("")
    } catch (err) {
      setError(getErrorMessage(err, "Could not load friends. Is the backend running?"))
    } finally {
      setLoading(false)
    }
  }, [search])

  // load on mount and whenever the search text changes (small delay while typing)
  useEffect(() => {
    const timer = window.setTimeout(reload, search ? 300 : 0)
    return () => window.clearTimeout(timer)
  }, [reload, search])

  // live updates from the server
  useFriendEvents(reload)

  /** Runs an action, triggers a refresh and returns an error message (or "" on success). */
  const run = useCallback(
    async (action: () => Promise<void>): Promise<string> => {
      let message = ""
      try {
        await action()
      } catch (err) {
        message = getErrorMessage(err, "Something went wrong. Please try again.")
      }
      // refreshes these lists (via useFriendEvents above) and the sidebar badge
      window.dispatchEvent(new Event(FRIENDS_CHANGED))
      return message
    },
    []
  )

  return {
    people,
    incoming,
    outgoing,
    friends,
    loading,
    error,
    send: (userId: string) => run(() => sendFriendRequest(userId)),
    accept: (requestId: string) => run(() => respondToFriendRequest(requestId, "accept")),
    decline: (requestId: string) => run(() => respondToFriendRequest(requestId, "decline")),
    cancel: (requestId: string) => run(() => cancelFriendRequest(requestId)),
    unfriend: (userId: string) => run(() => removeFriend(userId)),
  }
}
