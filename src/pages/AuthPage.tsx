import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import LoginForm from "../components/auth/LoginForm"
import SignupForm from "../components/auth/SignupForm"
import { BrandIcon } from "../components/icons"
import { colors, gradients } from "../theme"

export type AuthMode = "login" | "signup"

interface AuthPageProps {
  mode: AuthMode
  setIsLoggedIn: (value: boolean) => void
}

const SLIDE_MS = 700

const overlayContent: Record<
  AuthMode,
  { title: string; text: string; action: string }
> = {
  login: {
    title: "Hello, Friend!",
    text: "Enter your personal details and start your journey with us",
    action: "Sign up",
  },
  signup: {
    title: "Welcome Back!",
    text: "To keep connected with us please login with your personal info",
    action: "Sign in",
  },
}

export default function AuthPage({ mode, setIsLoggedIn }: AuthPageProps) {
  const navigate = useNavigate()
  const [pending, setPending] = useState<AuthMode | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const active = pending ?? mode
  const isLogin = active === "login"
  const next: AuthMode = isLogin ? "signup" : "login"

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function switchMode() {
    if (pending) return
    setPending(next)
    timer.current = window.setTimeout(() => {
      navigate(`/${next}`)
      setPending(null)
    }, SLIDE_MS)
  }

  const panelBase =
    "w-full flex-col items-center justify-center px-6 py-10 sm:px-10 md:absolute md:inset-y-0 md:w-1/2 md:flex transition-opacity duration-500"

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-100/40">
      <div
        className="relative w-full max-w-4xl md:h-[620px] overflow-hidden rounded-3xl border shadow-2xl shadow-slate-300/60"
        style={{
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
        }}
      >
        <div
          inert={!isLogin}
          className={`${panelBase} md:left-0 ${
            isLogin
              ? "flex md:opacity-100 md:delay-[250ms]"
              : "hidden md:opacity-0 md:pointer-events-none"
          }`}
        >
          <LoginForm setIsLoggedIn={setIsLoggedIn} />
        </div>

        <div
          inert={isLogin}
          className={`${panelBase} md:left-1/2 ${
            !isLogin
              ? "flex md:opacity-100 md:delay-[250ms]"
              : "hidden md:opacity-0 md:pointer-events-none"
          }`}
        >
          <SignupForm setIsLoggedIn={setIsLoggedIn} />
        </div>

        <div
          className="hidden md:block absolute top-0 left-0 z-10 h-full w-1/2 overflow-hidden text-white transition-transform duration-700 ease-in-out"
          style={{
            backgroundImage: gradients.primary,
            transform: isLogin ? "translateX(100%)" : "translateX(0)",
          }}
        >
          <span className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-white/10" />
          <span className="absolute -bottom-20 -right-12 h-72 w-72 rounded-full bg-white/10" />

          {(Object.keys(overlayContent) as AuthMode[]).map((key) => {
            const content = overlayContent[key]
            const visible = active === key
            return (
              <div
                key={key}
                inert={!visible}
                className={`absolute inset-0 flex flex-col items-center justify-center gap-4 px-12 text-center transition-all duration-500 ${
                  visible
                    ? "opacity-100 translate-y-0 delay-300"
                    : "opacity-0 translate-y-3 pointer-events-none"
                }`}
              >
                <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <BrandIcon className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight">
                  {content.title}
                </h2>
                <p className="max-w-xs text-sm leading-relaxed text-white/85">
                  {content.text}
                </p>
                <button
                  type="button"
                  onClick={switchMode}
                  className="mt-2 cursor-pointer rounded-full border-2 border-white px-10 py-2.5 text-sm font-semibold tracking-wide transition hover:bg-white hover:text-blue-700"
                >
                  {content.action}
                </button>
              </div>
            )
          })}
        </div>

        <p
          className="md:hidden pb-8 text-center text-sm"
          style={{ color: colors.secondaryText }}
        >
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={switchMode}
            className="cursor-pointer font-semibold hover:underline"
            style={{ color: colors.primary }}
          >
            {overlayContent[active].action}
          </button>
        </p>
      </div>
    </div>
  )
}
