import { Link, useNavigate, useLocation } from "react-router-dom"
import logoutIcon from "../assets/logout-icon.svg"
import profileIcon from "../assets/user-profile-icon.svg"

interface NavbarProps {
  isLoggedIn: boolean
  setIsLoggedIn: (value: boolean) => void
}

export default function Navbar({ isLoggedIn, setIsLoggedIn }: NavbarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    setIsLoggedIn(false)
    localStorage.removeItem("isLoggedIn")
    navigate("/login")
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 font-bold text-lg sm:text-xl text-slate-900 tracking-tight group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
          <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            SocialApp
          </span>
        </Link>

        {/* Navigation Links & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            to="/"
            className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              isActive("/")
                ? "bg-blue-50 text-blue-600 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </Link>

          <Link
            to="/profile"
            className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 group ${
              isActive("/profile")
                ? "bg-blue-50 text-blue-600 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <img
                src={profileIcon}
                alt="Profile"
                className="w-4.5 h-4.5 object-contain opacity-75 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <span>Profile</span>
          </Link>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/80 transition-all duration-200 cursor-pointer active:scale-95 group"
              title="Logout"
            >
              <img
                src={logoutIcon}
                alt="Logout"
                className="w-4 h-4 object-contain opacity-75 group-hover:opacity-100 transition-opacity"
              />
              <span className="hidden xs:inline sm:inline">Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all duration-200 active:scale-95"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}