import { useEffect, useState } from "react"
import type { MessageUser } from "../types/messages"
import { fetchFriends } from "../services/friendService"

/** Loads the logged-in user's friends (the only people they can message) whenever `enabled` becomes true. */
export function useUsers(enabled: boolean) {
  const [users, setUsers] = useState<MessageUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    setLoading(true)
    setError("")
    fetchFriends()
      .then((list) => {
        if (!cancelled) setUsers(list)
      })
      .catch(() => {
        if (!cancelled) setError("Could not load your friends. Is the backend running?")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [enabled])

  return { users, loading, error }
}
