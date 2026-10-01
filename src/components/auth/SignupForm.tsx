import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../Button"
import Input from "../Input"
import SocialButtons from "../SocialButtons"
import { UserIcon, MailIcon, LockIcon } from "../icons"
import { colors, typography } from "../../theme"

interface SignupFormProps {
  setIsLoggedIn: (value: boolean) => void
}

export default function SignupForm({ setIsLoggedIn }: SignupFormProps) {
  const [username, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [confirmError, setConfirmError] = useState("")
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match")
      return
    }

    setConfirmError("")
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
        Create Account
      </h2>

      <SocialButtons />

      <p className={typography.small} style={{ color: colors.mutedText }}>
        or use your email for registration
      </p>

      <div className="w-full space-y-3">
        <Input
          label="Username"
          type="text"
          placeholder="Username"
          icon={<UserIcon />}
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUserName(e.target.value)}
        />
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
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="Confirm password"
          icon={<LockIcon />}
          autoComplete="new-password"
          required
          error={confirmError}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        variant="gradient"
        className="rounded-full px-12 py-3 text-sm tracking-wide"
      >
        Sign up
      </Button>
    </form>
  )
}
