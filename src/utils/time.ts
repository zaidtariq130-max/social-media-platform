/** Returns "10:42 AM"-style text for a time string / ISO string / ms timestamp, or null if unparseable. */
function parseTime(val?: string | number): string | null {
  if (!val) return null
  if (typeof val === "string" && /^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(val.trim())) {
    return val.trim()
  }
  const d = new Date(val)
  if (isNaN(d.getTime())) return null
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

/** For message bubbles: falls back to the raw value if it cannot be parsed. */
export function formatMessageTime(val?: string | number): string {
  return parseTime(val) ?? (val ? String(val) : "")
}

/** For the conversation list: shows nothing if the value cannot be parsed. */
export function formatListTime(val?: string | number): string {
  return parseTime(val) ?? ""
}

/** "10:42 AM"-style clock text for a millisecond timestamp. */
export function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

/** Day label for chat separators: "Today", "Yesterday" or a short date. */
export function formatDayLabel(ms: number): string {
  const d = new Date(ms)
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86_400_000)
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  return d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })
}

/** True when both timestamps fall on the same calendar day. */
export function isSameDay(a: number, b: number): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString()
}
