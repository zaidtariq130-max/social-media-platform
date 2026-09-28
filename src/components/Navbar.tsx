import { Link, useNavigate } from "react-router-dom"

interface NavbarProps {
  isLoggedIn: boolean
  setIsLoggedIn: (value: boolean) => void
}

export default function Navbar({isLoggedIn,setIsLoggedIn}: NavbarProps) {
  const navigate = useNavigate()

  function handleLogout() {
    setIsLoggedIn(false)
    localStorage.removeItem("isLoggedIn")
    navigate("/login")
  }

  return (
    <nav>
      <Link to="/">Home</Link>

      {isLoggedIn ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <Link to="/login">Login</Link>
      )}

      <Link to="/profile">Profile</Link>
    </nav>
  )
}