import type { ReactNode } from "react"
import { colors } from "../../theme"
import Badge, { type BadgeTone } from "./Badge"

const ACCENTS = {
  blue: { text: "text-blue-600", bar: "bg-blue-600" },
  rose: { text: "text-rose-600", bar: "bg-rose-600" },
  purple: { text: "text-purple-600", bar: "bg-purple-600" },
} as const

export interface TabItem<T extends string> {
  id: T
  label: string
  icon?: ReactNode
  accent?: keyof typeof ACCENTS
  /** Shown only when count > 0. */
  badge?: { count: number; tone: BadgeTone }
}

interface TabsProps<T extends string> {
  items: TabItem<T>[]
  active: T
  onChange: (id: T) => void
  className?: string
}

/** Equal-width tab bar with an underline on the active tab. */
export default function Tabs<T extends string>({ items, active, onChange, className = "" }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={`flex border-b text-xs font-semibold shrink-0 ${className}`}
      style={{ borderColor: colors.border }}
    >
      {items.map((item) => {
        const isActive = item.id === active
        const accent = ACCENTS[item.accent ?? "blue"]

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={`flex-1 py-3 text-center transition cursor-pointer relative flex items-center justify-center gap-1.5 ${
              isActive ? `${accent.text} font-bold` : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && item.badge.count > 0 && (
              <Badge tone={item.badge.tone}>{item.badge.count}</Badge>
            )}
            {isActive && <span className={`absolute bottom-0 inset-x-0 h-0.5 ${accent.bar}`} />}
          </button>
        )
      })}
    </div>
  )
}
