import type { ReactNode } from "react"

interface ButtonProp {
  children: ReactNode
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  className?: string
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost"
  disabled?: boolean
}

export default function Button({
  children,
  onClick,
  type = "button",
  className = "",
  variant = "primary",
  disabled = false,
}: ButtonProp) {
  const variantStyles = {
    primary:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30",
    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-sm",
    danger:
      "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 hover:border-rose-300 shadow-sm",
    outline:
      "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm",
    ghost:
      "hover:bg-slate-100 text-slate-600",
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-medium px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none text-sm ${variantStyles[variant] || variantStyles.primary} ${className}`}
    >
      {children}
    </button>
  )
}
