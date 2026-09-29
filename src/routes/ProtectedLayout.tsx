import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"

interface ProtectedLayoutProps {
  isLoggedIn: boolean
  setIsLoggedIn: (value: boolean) => void
}

export default function ProtectedLayout({
  isLoggedIn,
  setIsLoggedIn
}: ProtectedLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}