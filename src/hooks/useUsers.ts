import { useEffect, useState } from "react"
import type { MessageUser } from "../types/messages"
import { fetchUsers } from "../services/userService"

/** Loads the list of other users whenever `enabled` becomes true. */
export function useUsers(enabled: boolean) {
  const [users, setUsers] = useState<MessageUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    setLoading(true)
    setError("")
    fetchUsers()
      .then((list) => {
        if (!cancelled) setUsers(list)
      })
      .catch(() => {
        if (!cancelled) setError("Could not load users. Is the backend running?")
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
