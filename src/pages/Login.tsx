import AuthPage from "./AuthPage"

interface LoginProps {
  setIsLoggedIn: (value: boolean) => void
}

export default function Login({ setIsLoggedIn }: LoginProps) {
  return <AuthPage mode="login" setIsLoggedIn={setIsLoggedIn} />
}
