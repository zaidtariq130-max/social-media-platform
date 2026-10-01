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
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoggedIn(true)
    navigate("/welcome")
  }

  return (
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

      <p className={typography.small} style={{ color: colors.mutedText }}>
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
      >
        Sign in
      </Button>
    </form>
  )
}
