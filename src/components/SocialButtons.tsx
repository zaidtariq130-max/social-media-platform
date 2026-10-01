import { colors } from "../theme"
import { FacebookIcon, GoogleIcon, LinkedInIcon } from "./icons"

const providers = [
  { name: "Facebook", icon: <FacebookIcon /> },
  { name: "Google", icon: <GoogleIcon /> },
  { name: "LinkedIn", icon: <LinkedInIcon /> },
]

export default function SocialButtons() {
  return (
    <div className="flex items-center justify-center gap-3">
      {providers.map((provider) => (
        <button
          key={provider.name}
          type="button"
          aria-label={`Continue with ${provider.name}`}
          className="w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.background,
          }}
        >
          {provider.icon}
        </button>
      ))}
    </div>
  )
}
