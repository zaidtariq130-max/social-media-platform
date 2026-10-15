import type { ReactNode } from "react"

const TONES = {
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  purpleSoft: "bg-purple-50 text-purple-700 border border-purple-200",
  rose: "bg-rose-100 text-rose-700",
  solidRose: "bg-rose-500 text-white",
} as const

const SIZES = {
  sm: "text-[10px] px-1.5 py-0.5 font-bold",
  md: "text-xs px-2 py-0.5 font-semibold",
} as const

export type BadgeTone = keyof typeof TONES

interface BadgeProps {
  tone?: BadgeTone
  size?: keyof typeof SIZES
  className?: string
  children: ReactNode
}

/** Small pill used for counts and labels ("Direct", "Group", unread counts). */
export default function Badge({ tone = "blue", size = "sm", className = "", children }: BadgeProps) {
  return (
    <span className={`rounded-full inline-block ${SIZES[size]} ${TONES[tone]} ${className}`}>
      {children}
    </span>
  )
}
