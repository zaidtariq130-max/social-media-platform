import { useState, type ReactNode } from "react"
import { colors } from "../theme"
import { EyeIcon, EyeOffIcon } from "./icons"

interface InputProps {
  label?: string // ab use nahi hota, bas purane code ko error na aaye isliye rakha hai
  type: "text" | "email" | "password"
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  icon?: ReactNode
  error?: string
  required?: boolean
  autoComplete?: string
}

export default function Input({
  type,
  placeholder,
  value,
  onChange,
  icon,
  error,
  required = false,
  autoComplete,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === "password"
  const inputType = isPassword && showPassword ? "text" : type

  return (
    <div className="w-full text-left">
      <div className="relative">
        {icon && (
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: colors.mutedText }}
          >
            {icon}
          </span>
        )}

        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border-2 py-3 text-sm outline-none transition focus:ring-2 focus:ring-blue-500/40 placeholder:text-slate-400 ${
            icon ? "pl-11" : "pl-4"
          } ${isPassword ? "pr-11" : "pr-4"}`}
          style={{
            backgroundColor: colors.inputBackground,
            color: colors.text,
            borderColor: error ? colors.danger : "transparent",
          }}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md cursor-pointer hover:opacity-80"
            style={{ color: colors.mutedText }}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs" style={{ color: colors.danger }}>
          {error}
        </p>
      )}
    </div>
  )
}