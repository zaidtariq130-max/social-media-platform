import { useEffect, type ReactNode } from "react"
import { colors } from "../../theme"
import { CloseIcon } from "../icons"

interface ModalProps {
  title: string
  /** Optional element shown next to the title (e.g. a Badge). */
  badge?: ReactNode
  onClose: () => void
  children: ReactNode
}

/** Centered dialog with header, close button and Escape-to-close. Render it only while open. */
export default function Modal({ title, badge, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        style={{
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          color: colors.text,
        }}
      >
        <div
          className="p-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: colors.border }}
        >
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base sm:text-lg">{title}</h2>
            {badge}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
