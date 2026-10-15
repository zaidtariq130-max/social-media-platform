import type { ButtonHTMLAttributes } from "react"

export default function IconButton({
  className = "",
  type = "button",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`p-2 rounded-full hover:bg-slate-100 transition cursor-pointer ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
