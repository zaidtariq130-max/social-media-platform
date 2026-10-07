import { Link, useNavigate, useLocation } from "react-router-dom"
import { colors } from "../theme"
import { BrandIcon, HomeIcon, LogoutIcon, UserIcon } from "./icons"

interface NavbarProps {
  isLoggedIn: boolean
  setIsLoggedIn: (value: boolean) => void
}

export default function Navbar({
  isLoggedIn,
  setIsLoggedIn,
}: NavbarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    setIsLoggedIn(false)
    localStorage.removeItem("token")
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
            <BrandIcon className="w-5 h-5" />
          </div>

          <span>SocialApp</span>
        </Link>

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
            <HomeIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
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
            <UserIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
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
              <LogoutIcon className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">
                Logout
              </span>
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

