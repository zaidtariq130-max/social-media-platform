import type { MessageUser } from "../../../types/messages"
import { colors } from "../../../theme"
import Avatar from "../../common/Avatar"

interface Props {
  contacts: MessageUser[]
  onSelectContact: (contact: MessageUser) => void
}

/** Horizontal strip of currently-online contacts. */
export default function ActiveContactsStrip({ contacts, onSelectContact }: Props) {
  return (
    <div
      className="px-3 pb-3 pt-1 border-b overflow-x-auto scrollbar-none flex gap-3 shrink-0"
      style={{ borderColor: colors.border }}
    >
      {contacts.map((contact) => (
        <button
          key={contact.id}
          type="button"
          onClick={() => onSelectContact(contact)}
          className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
        >
          <Avatar
            src={contact.avatar}
            alt={contact.name}
            size="lg"
            isOnline
            className="border-2 border-blue-500 p-0.5 group-hover:scale-105 transition-transform"
          />
          <span className="text-[11px] font-medium text-slate-600 max-w-[56px] truncate text-center">
            {contact.name.split(" ")[0]}
          </span>
        </button>
      ))}
    </div>
  )
}
