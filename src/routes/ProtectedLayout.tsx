import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { colors, typography, layout } from "../theme"
import { connectSocket, disconnectSocket } from "../socket/socket"

interface ProtectedLayoutProps {
  isLoggedIn: boolean
  setIsLoggedIn: (value: boolean) => void
}

export default function ProtectedLayout({
  isLoggedIn,
  setIsLoggedIn,
}: ProtectedLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.innerWidth >= layout.breakpoint
  )

  // One real-time connection for the whole logged-in area (presence + live messages everywhere)
  useEffect(() => {
    connectSocket()
    return () => disconnectSocket()
  }, [])

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${layout.breakpoint}px)`)
    const onChange = (e: MediaQueryListEvent) => setIsSidebarOpen(e.matches)

    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return (
    <div
      className={`min-h-screen font-sans ${typography.body}`}
      style={{
        backgroundColor: colors.background,
        color: colors.text,
      }}
    >
      <div className={`grid min-h-screen ${layout.gridColumns}`}>
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
        />

        <div className="min-w-0 flex flex-col">
          <Header />

          <main className={`flex-1 ${layout.contentPadding}`}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
