import { useCallback, useEffect, useRef, useState } from "react"

const DEFAULT_DURATION_MS = 1800


export function useToast(durationMs = DEFAULT_DURATION_MS) {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<number | null>(null)

  const clearTimer = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }

  const hideToast = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    setMessage(null)
  }, [])

  const showToast = useCallback(
    (text: string) => {
      if (timer.current !== null) window.clearTimeout(timer.current)
      setMessage(text)
      timer.current = window.setTimeout(() => {
        timer.current = null
        setMessage(null)
      }, durationMs)
    },
    [durationMs]
  )

  useEffect(() => clearTimer, [])

  return { toastMessage: message, showToast, hideToast }
}
