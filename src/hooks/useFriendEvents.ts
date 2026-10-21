import { useEffect, useRef } from "react"
import { getSocket } from "../socket/socket"

const FRIEND_EVENTS = ["friend:request", "friend:updated"] as const

/** Fired on `window` after the logged-in user changes a request, so other components can refresh. */
export const FRIENDS_CHANGED = "friends:changed"

/**
 * Calls `onChange` whenever the server says a friend request changed
 * (someone sent / accepted / declined / cancelled a request, or unfriended me)
 * or when this user changed something themselves.
 */
export function useFriendEvents(onChange: () => void) {
  const ref = useRef(onChange)
  ref.current = onChange

  useEffect(() => {
    const socket = getSocket()
    const handler = () => ref.current()

    FRIEND_EVENTS.forEach((event) => socket.on(event, handler))
    window.addEventListener(FRIENDS_CHANGED, handler)
    return () => {
      FRIEND_EVENTS.forEach((event) => socket.off(event, handler))
      window.removeEventListener(FRIENDS_CHANGED, handler)
    }
  }, [])
}
