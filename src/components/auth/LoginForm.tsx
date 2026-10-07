import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../Button"
import Input from "../Input"
import SocialButtons from "../SocialButtons"
import { MailIcon, LockIcon } from "../icons"
import { colors, typography } from "../../theme"

interface LoginFormProps {
  setIsLoggedIn: (value: boolean) => void
}

export default function LoginForm({ setIsLoggedIn }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [errorTitle, setErrorTitle] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setErrorTitle("")
    setErrorMessage("")
    setLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorTitle(data.message || "Login failed")
        setErrorMessage(
          data.detail || "Something went wrong. Please try again."
        )
        return
      }

      localStorage.setItem("token", data.token)

      setIsLoggedIn(true)
      navigate("/welcome")
    } catch (error) {
      console.error("Login error:", error)

      setErrorTitle("Connection error")
      setErrorMessage("Unable to connect to the server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col items-center gap-4"
      >
        <h2
          className={`text-3xl ${typography.heading} tracking-tight`}
          style={{ color: colors.text }}
        >
          Sign in
        </h2>

        <SocialButtons />

        <p
          className={typography.small}
          style={{ color: colors.mutedText }}
        >
          or use your account
        </p>

        <div className="w-full space-y-3">
          <Input
            label="Email"
            type="email"
            placeholder="Email"
            icon={<MailIcon />}
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Password"
            icon={<LockIcon />}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="button"
          className={`${typography.small} cursor-pointer hover:underline`}
          style={{ color: colors.secondaryText }}
        >
          Forgot your password?
        </button>

        <Button
          type="submit"
          variant="gradient"
          className="rounded-full px-12 py-3 text-sm tracking-wide"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      {errorTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">

          <div
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border p-6 shadow-2xl"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
            }}
          >
            <div className="flex flex-col items-center text-center">

              
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                }}
              >
                ⚠️
              </div>

              <h3
                className={`${typography.body} font-semibold`}
                style={{ color: colors.text }}
              >
                {errorTitle}
              </h3>

              <p
                className={`${typography.small} mt-2`}
                style={{ color: colors.mutedText }}
              >
                {errorMessage}
              </p>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setErrorTitle("")
                  setErrorMessage("")
                }}
                className="mt-5 rounded-full px-6 py-2 text-sm font-medium transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                }}
              >
                Okay
              </button>
            </div>


            <div
              className="absolute bottom-0 left-0 h-1 w-full"
              style={{ backgroundColor: colors.primary }}
            />
          </div>
        </div>
      )}
    </>
  )
}