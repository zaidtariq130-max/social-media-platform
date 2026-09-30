import { useState } from "react"
import Button from "../components/Button"
import { useNavigate } from "react-router-dom"
import { colors, typography } from "../theme"

interface LoginProps {
  setIsLoggedIn: (value: boolean) => void
}

export default function Login({ setIsLoggedIn }: LoginProps) {
  const [username, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  function handleLogin() {
    setIsLoggedIn(true)
    localStorage.setItem("isLoggedIn", "true")
    navigate("/")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleLogin()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-100/40">
      <div
        className="w-full max-w-md rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/60 border"
        style={{
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-4"
            style={{ backgroundColor: colors.primary }}
          >
            <svg
              className="w-7 h-7 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight`}
            style={{ color: colors.text }}
          >
            Welcome back
          </h1>
          <p
            className={`${typography.small} mt-1.5`}
            style={{ color: colors.secondaryText }}
          >
            Sign in to continue to your social feed
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label
              className={`block ${typography.small} font-semibold uppercase tracking-wider`}
              style={{ color: colors.secondaryText }}
            >
              Username
            </label>
            <div className="relative">
              <span
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                style={{ color: colors.secondaryText }}
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your username"
                className="w-full pl-10 pr-4 py-3 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                style={{
                  backgroundColor: colors.secondaryBackground,
                  borderColor: colors.border,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              className={`block ${typography.small} font-semibold uppercase tracking-wider`}
              style={{ color: colors.secondaryText }}
            >
              Password
            </label>
            <div className="relative">
              <span
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                style={{ color: colors.secondaryText }}
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-3 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                style={{
                  backgroundColor: colors.secondaryBackground,
                  borderColor: colors.border,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                }}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              onClick={handleLogin}
              className="w-full py-3 text-base shadow-md shadow-blue-500/25 cursor-pointer"
            >
              Sign In
            </Button>
          </div>
        </form>

        <div
          className="mt-6 pt-5 text-center"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <p
            className={typography.small}
            style={{ color: colors.secondaryText }}
          >
            Demo project • Enter any credentials to sign in
          </p>
        </div>
      </div>
    </div>
  )
}
