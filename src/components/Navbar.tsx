import { Link, useNavigate, useLocation } from "react-router-dom"
import { colors } from "../theme"

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
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b shadow-xs transition-colors"
      style={{
        backgroundColor: `${colors.cardBackground}f2`,
        borderColor: colors.border,
      }}
    >
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        <Link
          to="/"
          className="flex items-center gap-2.5 font-bold text-lg sm:text-xl tracking-tight group"
          style={{ color: colors.text }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform"
            style={{ backgroundColor: colors.primary }}
          >
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>

          <span>SocialApp</span>
        </Link>

        {/* Navigation Links & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            to="/"
            className="px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:bg-slate-100"
            style={
              isActive("/")
                ? {
                    backgroundColor: colors.activeBackground,
                    color: colors.iconActive,
                  }
                : {
                    color: colors.iconInactive,
                  }
            }
          >
            <svg
              className="w-4 h-4 sm:w-4.5 sm:h-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>

            <span>Home</span>
          </Link>

          <Link
            to="/profile"
            className="px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:bg-slate-100 group"
            style={
              isActive("/profile")
                ? {
                    backgroundColor: colors.activeBackground,
                    color: colors.iconActive,
                  }
                : {
                    color: colors.iconInactive,
                  }
            }
          >
            <svg
              className="w-4 h-4 sm:w-4.5 sm:h-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>

            <span>Profile</span>
          </Link>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium bg-rose-50/70 hover:bg-rose-100 transition-all duration-200 cursor-pointer active:scale-95 group"
              style={{
                color: colors.danger,
                border: `1px solid ${colors.danger}`,
              }}
              title="Logout"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>

              <span className="hidden xs:inline sm:inline">Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white shadow-sm shadow-blue-500/20 transition-all duration-200 active:scale-95"
              style={{ backgroundColor: colors.primary }}
            >
              Login
            </Link>
          )}

        </div>
      </nav>
    </header>
  )
}
