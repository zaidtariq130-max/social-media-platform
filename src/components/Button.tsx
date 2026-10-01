import type { ReactNode } from "react"
import { colors, gradients } from "../theme"

interface ButtonProp {
  children: ReactNode
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  className?: string
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost" | "gradient"
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
      "text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30",

    secondary:
      "border shadow-sm",

    danger:
      "text-white border border-rose-600 shadow-sm",

    outline:
      "border shadow-sm",

    ghost:
      "",

    gradient:
      "text-white shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40",
  }

  const radius = className.includes("rounded") ? "" : "rounded-xl"

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={
        variant === "primary"
          ? { backgroundColor: colors.primary }
          : variant === "danger"
          ? { backgroundColor: colors.danger }
          : variant === "secondary"
          ? {
              backgroundColor: colors.secondaryBackground,
              color: colors.secondaryText,
              borderColor: colors.border,
            }
          : variant === "outline"
          ? {
              backgroundColor: colors.outlineBackground,
              color: colors.text,
              borderColor: colors.border,
            }
          : variant === "gradient"
          ? { backgroundImage: gradients.primary }
          : variant === "ghost"
          ? {
              backgroundColor: colors.ghostBackground,
              color: colors.text,
            }
          : undefined
      }
      className={`inline-flex items-center justify-center gap-2 font-medium px-4 py-2.5 ${radius} transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none text-sm ${variantStyles[variant] || variantStyles.primary} ${className}`}
    >
      {children}
    </button>
  )
}
