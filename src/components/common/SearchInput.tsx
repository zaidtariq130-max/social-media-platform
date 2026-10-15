import { SearchIcon } from "../icons"
import { colors } from "../../theme"

const ACCENTS = {
  blue: "focus-within:ring-blue-500/20 focus-within:border-blue-500",
  purple: "focus-within:ring-purple-500/20 focus-within:border-purple-500",
} as const

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  accent?: keyof typeof ACCENTS
  className?: string
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  accent = "blue",
  className = "",
}: SearchInputProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border focus-within:ring-2 transition ${ACCENTS[accent]} ${className}`}
      style={{ backgroundColor: colors.secondaryBackground, borderColor: colors.border }}
    >
      <SearchIcon className="w-4 h-4 text-slate-400 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          ✕
        </button>
      )}
    </div>
  )
}
