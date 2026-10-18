import { TrashIcon } from "../icons"

export interface ConfirmDialogState {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
}

interface ConfirmDialogProps {
  dialog: ConfirmDialogState | null
  onClose: () => void
}

/** Yes / No confirmation used for remove contact, clear chat, delete request. */
export default function ConfirmDialog({ dialog, onClose }: ConfirmDialogProps) {
  if (!dialog) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 mx-auto flex items-center justify-center">
          <TrashIcon className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="font-bold text-base text-slate-900">{dialog.title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{dialog.description}</p>
        </div>

        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
          >
            No
          </button>

          <button
            type="button"
            onClick={dialog.onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition cursor-pointer shadow-sm shadow-rose-600/20"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  )
}
