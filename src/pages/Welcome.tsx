import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { BrandIcon } from "../components/icons"
import { gradients } from "../theme"

const REDIRECT_MS = 3000

export default function Welcome() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate("/"), REDIRECT_MS)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 text-center text-white"
      style={{ backgroundImage: gradients.primary }}
    >
      <span className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10" />
      <span className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/10" />

      <div className="relative flex h-32 w-32 items-center justify-center">
        <span className="welcome-ring absolute inset-0 rounded-full border-2 border-white/50" />
        <span
          className="welcome-ring absolute inset-0 rounded-full border-2 border-white/50"
          style={{ animationDelay: "1.1s" }}
        />
        <div className="welcome-pop relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 shadow-xl backdrop-blur">
          <BrandIcon className="h-10 w-10" />
        </div>
      </div>

      <h1
        className="welcome-fade mt-8 text-4xl sm:text-5xl font-extrabold tracking-tight"
        style={{ animationDelay: "0.4s" }}
      >
        Welcome
      </h1>
      <p
        className="welcome-fade mt-3 text-base text-white/80"
        style={{ animationDelay: "0.7s" }}
      >
        Getting your feed ready
      </p>

      <div
        className="welcome-fade mt-10 h-1.5 w-56 sm:w-72 overflow-hidden rounded-full bg-white/20"
        style={{ animationDelay: "0.9s" }}
        role="progressbar"
        aria-label="Loading your feed"
      >
        <div
          className="welcome-progress h-full rounded-full bg-white"
          style={{ animationDuration: `${REDIRECT_MS}ms`, animationDelay: "0.9s" }}
        />
      </div>

      <div className="mt-6 flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="welcome-dot h-2 w-2 rounded-full bg-white"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
