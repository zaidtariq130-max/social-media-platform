import { TrashIcon } from "../icons"

export interface MessageDeleteTarget {
  conversationId: string
  messageId: string
  isMyMessage: boolean
}

interface MessageDeleteDialogProps {
  target: MessageDeleteTarget | null
  onDeleteForEveryone: (conversationId: string, messageId: string) => void
  onDeleteForMe: (conversationId: string, messageId: string) => void
  onClose: () => void
}

/** WhatsApp-style choice: delete for everyone (own messages only) / for me / cancel. */
export default function MessageDeleteDialog({
  target,
  onDeleteForEveryone,
  onDeleteForMe,
  onClose,
}: MessageDeleteDialogProps) {
  if (!target) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 mx-auto flex items-center justify-center">
          <TrashIcon className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="font-bold text-base text-slate-900">Delete Message?</h3>
          <p className="text-xs text-slate-500">Choose how you want to delete this message.</p>
        </div>

        <div className="space-y-2 pt-2">
          {target.isMyMessage && (
            <button
              type="button"
              onClick={() => onDeleteForEveryone(target.conversationId, target.messageId)}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              Delete for Everyone
            </button>
          )}

          <button
            type="button"
            onClick={() => onDeleteForMe(target.conversationId, target.messageId)}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Delete for Me
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-medium transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
