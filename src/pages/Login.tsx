import { useState } from "react"
import Button from "../components/Button"
import { useNavigate } from "react-router-dom"
interface LoginProps {
    setIsLoggedIn: (value: boolean) => void
}
export default function Login({setIsLoggedIn}:LoginProps) {
    const[username, setUserName]=useState("")
    const[password, setPassword]=useState("")
    const navigate = useNavigate()
    function handleLogin() {
     setIsLoggedIn(true)
     localStorage.setItem("isLoggedIn", "true")
     navigate("/")
}
  return (
    <div>
        <input
        type="username"
         value={username}
         onChange={(e) => setUserName(e.target.value)}
        />
        <input
        type="password"
         value={password}
         onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleLogin}>Login</Button>
    </div>
  )
}
