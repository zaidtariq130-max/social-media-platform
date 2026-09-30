import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"
import { colors, spacing, typography } from "../theme"

interface ProtectedLayoutProps {
  isLoggedIn: boolean
  setIsLoggedIn: (value: boolean) => void
}

export default function ProtectedLayout({
  isLoggedIn,
  setIsLoggedIn
}: ProtectedLayoutProps) {
  return (
    <div
      className={`min-h-screen flex flex-col font-sans ${typography.body}`}
      style={{
        backgroundColor: colors.background,
        color: colors.text,
      }}
    >
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      <main
        className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{
          paddingTop: spacing.lg,
          paddingBottom: spacing.lg,
        }}
      >
        <Outlet />
      </main>
    </div>
  )
}

