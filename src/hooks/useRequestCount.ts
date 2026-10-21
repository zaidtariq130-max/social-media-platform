import { useCallback, useEffect, useState } from "react"
import { fetchRequests } from "../services/friendService"
import { useFriendEvents } from "./useFriendEvents"

/** Number of friend requests waiting for the logged-in user (used for the sidebar badge). */
export function useRequestCount() {
  const [count, setCount] = useState(0)

  const load = useCallback(() => {
    fetchRequests("incoming")
      .then((list) => setCount(list.length))
      .catch(() => {
        // the badge is optional; ignore errors
      })
  }, [])

  useEffect(load, [load])
  useFriendEvents(load)

  return count
}
