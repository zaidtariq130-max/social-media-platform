interface ToastProps {
  message: string | null
  onDismiss: () => void
}

/** Small message in the bottom-right corner of the chat. Click or hover to dismiss immediately. */
export default function Toast({ message, onDismiss }: ToastProps) {
  if (!message) return null

  return (
    <div
      onMouseEnter={onDismiss}
      onClick={onDismiss}
      className="fixed sm:absolute bottom-5 right-5 z-50 bg-slate-900/95 hover:bg-slate-800 text-white px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium shadow-2xl backdrop-blur-xs animate-in fade-in slide-in-from-bottom-2 duration-150 border border-slate-700/80 flex items-center gap-2.5 cursor-pointer select-none transition-all hover:scale-95 hover:opacity-0"
      title="Hover or click to dismiss immediately"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
      <span>{message}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDismiss()
        }}
        className="ml-1 text-slate-400 hover:text-white text-xs px-1 rounded cursor-pointer"
      >
        ✕
      </button>
    </div>
  )
}
