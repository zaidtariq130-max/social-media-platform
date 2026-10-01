import AuthPage from "./AuthPage"

interface SignupProps {
  setIsLoggedIn: (value: boolean) => void
}

export default function Signup({ setIsLoggedIn }: SignupProps) {
  return <AuthPage mode="signup" setIsLoggedIn={setIsLoggedIn} />
}
