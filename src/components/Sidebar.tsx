import type { CSSProperties } from "react"
import { Link, useLocation } from "react-router-dom"
import { BrandIcon, HomeIcon, UserIcon, LogoutIcon, ChevronLeftIcon } from "./icons"
import { colors, layout } from "../theme"
import { APP_NAME, AUTH_STORAGE_KEY } from "../config/app"

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  isLoggedIn: boolean
  setIsLoggedIn: (value: boolean) => void
}

const themeVars = {
  "--nav-hover": colors.ghostBackground,
  "--nav-danger-hover": colors.dangerBackground,
} as CSSProperties


const navLinks = [
  { to: "/", label: "Home", Icon: HomeIcon },
  { to: "/profile", label: "Profile", Icon: UserIcon },
]

export default function Sidebar({
  isOpen,
  setIsOpen,
  isLoggedIn,
  setIsLoggedIn,
}: SidebarProps) {
  const location = useLocation()

  function handleLogout() {
    setIsLoggedIn(false)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  function closeOnMobile() {
    if (window.innerWidth < layout.breakpoint) {
      setIsOpen(false)
    }
  }

  const isActive = (path: string) => location.pathname === path

  const labelVisibility = isOpen ? "" : "hidden"

  const navItemClass = `flex items-center gap-3 rounded-xl px-3 py-3 transition ${
    isOpen ? "" : "justify-center"
  }`


  return (
    <>
      {isOpen && (
        <div
          className={`fixed inset-0 z-30 ${layout.sidebarOverlayHidden}`}
          style={{ backgroundColor: colors.overlay }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`sticky top-0 z-40 h-screen shrink-0 transition-all duration-300 ${
          layout.sidebarSlotMobile
        } ${
          isOpen
            ? layout.sidebarSlotExpanded
            : layout.sidebarSlotCollapsed
        }`}
        style={themeVars}
      >
        <aside
          className={`absolute inset-y-0 left-0 border-r transition-all duration-300 ${layout.sidebarAsideFull} ${
            isOpen
              ? `${layout.sidebarWidthExpanded} ${layout.sidebarShadowExpanded}`
              : layout.sidebarWidthCollapsed
          }`}
          style={{
            backgroundColor: colors.sidebarBackground,
            borderColor: colors.border,
          }}
        >
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="absolute -right-3 top-5 z-50 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border shadow-sm"
            style={{
              backgroundColor: colors.sidebarBackground,
              borderColor: colors.border,
              color: colors.iconInactive,
            }}
          >
            <ChevronLeftIcon
              className={`h-4 w-4 transition-transform duration-300 ${
                isOpen ? "" : "rotate-180"
              }`}
            />
          </button>

          <div
            className={`${layout.headerHeight} flex items-center border-b ${
              isOpen ? "px-4" : "justify-center px-0"
            }`}
            style={{ borderColor: colors.border }}
          >
            <Link
              to="/"
              onClick={closeOnMobile}
              className="flex items-center gap-2"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: colors.primary }}
              >
                <BrandIcon className="w-5 h-5" />
              </div>

              <span
                className={`font-bold text-lg ${labelVisibility}`}
                style={{ color: colors.text }}
              >
                {APP_NAME}
              </span>
            </Link>
          </div>

          <nav className="p-3 space-y-2">
            {navLinks.map(({ to, label, Icon }) => {
              const active = isActive(to)

              return (
                <Link
                  key={to}
                  to={to}
                  onClick={closeOnMobile}
                  title={isOpen ? undefined : label}
                  className={`${navItemClass} ${
                    active ? "" : "hover:bg-(--nav-hover)"
                  }`}
                  style={{
                    backgroundColor: active
                      ? colors.activeBackground
                      : undefined,
                    color: active
                      ? colors.iconActive
                      : colors.iconInactive,
                  }}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className={labelVisibility}>{label}</span>
                </Link>
              )
            })}

            {isLoggedIn && (
              <button
                type="button"
                onClick={handleLogout}
                title={isOpen ? undefined : "Logout"}
                className={`${navItemClass} w-full cursor-pointer hover:bg-(--nav-danger-hover)`}
                style={{ color: colors.danger }}
              >
                <LogoutIcon className="w-5 h-5 shrink-0" />
                <span className={labelVisibility}>Logout</span>
              </button>
            )}
          </nav>
        </aside>
      </div>
    </>
  )
}