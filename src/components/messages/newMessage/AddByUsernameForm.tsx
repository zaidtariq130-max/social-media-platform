import { useState, type FormEvent } from "react"
import type { MessageUser } from "../../../types/messages"
import { colors } from "../../../theme"
import { fetchUserByUsername } from "../../../services/userService"
import { getErrorMessage } from "../../../utils/errors"

interface Props {
  onSubmit: (user: MessageUser) => void
  onCancel: () => void
}

/** Looks the username up on the server, so the chat is always started with a real user id. */
export default function AddByUsernameForm({ onSubmit, onCancel }: Props) {
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const clean = username.trim().replace(/^@/, "")
    if (!clean || loading) return

    setLoading(true)
    setError("")
    try {
      onSubmit(await fetchUserByUsername(clean))
    } catch (err) {
      setError(getErrorMessage(err, "Could not look that username up. Please try again."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div>
        <label htmlFor="new-chat-username" className="block text-xs font-semibold text-slate-700 mb-1.5">
          Username (@)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-semibold">@</span>
          <input
            id="new-chat-username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.replace(/^@/, ""))
              setError("")
            }}
            placeholder="Enter username (e.g. johndoe)"
            className="w-full pl-8 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            required
            autoFocus
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-1.5">
          Enter the user's handle to send a direct message request. Once they accept, you can chat with them.
        </p>
        {error && (
          <p role="alert" className="text-[11px] text-rose-600 mt-1.5">
            {error}
          </p>
        )}
      </div>

      <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!username.trim() || loading}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 shadow-sm transition"
          style={{ backgroundColor: colors.primary }}
        >
          {loading ? "Searching..." : "Send Request"}
        </button>
      </div>
    </form>
  )
}
