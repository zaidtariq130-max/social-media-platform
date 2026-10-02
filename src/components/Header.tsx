import { UserIcon } from "./icons"
import { colors, layout } from "../theme"
import { APP_NAME } from "../config/app"

export default function Header() {
  return (
    <header
      className={`sticky top-0 z-20 ${layout.headerHeight} border-b flex items-center justify-between ${layout.headerPadding}`}
      style={{
        backgroundColor: colors.headerBackground,
        borderColor: colors.border,
      }}
    >
      <h1 className="text-lg font-semibold" style={{ color: colors.text }}>
        {APP_NAME}
      </h1>

      <div className="flex items-center gap-2">
        <UserIcon className="w-5 h-5" style={{ color: colors.iconInactive }} />
      </div>
    </header>
  )
}
