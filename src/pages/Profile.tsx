import { colors, spacing, typography } from "../theme"

export default function Profile() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div
        className="rounded-3xl border shadow-xs overflow-hidden"
        style={{
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
        }}
      >

        <div
          className="h-32 sm:h-44 relative"
          style={{ backgroundColor: colors.primary }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Active Member</span>
          </div>
        </div>


        <div
          className="pb-8 pt-0 relative"
          style={{
            paddingLeft: spacing.lg,
            paddingRight: spacing.lg,
          }}
        >
          {/* Avatar */}
          <div className="-mt-14 sm:-mt-18 mb-4 relative inline-block">
            <img
              src="https://i.pravatar.cc/150?img=12"
              alt="Profile"
              width="150"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
            />
            <span className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Online" />
          </div>

  
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2
                className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                style={{ color: colors.text }}
              >
                Zaid
              </h2>
              <span
                className="w-5 h-5 rounded-full text-white flex items-center justify-center text-xs"
                style={{ backgroundColor: colors.primary }}
                title="Verified"
              >
                ✓
              </span>
            </div>
            <p
              className={`${typography.small} sm:text-base flex items-center gap-2`}
              style={{ color: colors.secondaryText }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: colors.iconInactive }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>zaid@example.com</span>
            </p>
          </div>

          <p
            className={`mt-4 ${typography.small} sm:text-base leading-relaxed`}
            style={{ color: colors.secondaryText }}
          >
            Frontend enthusiast & software engineer passionate about crafting delightful, modern user experiences.
          </p>

          <div
            className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 text-center"
            style={{ borderTop: `1px solid ${colors.border}` }}
          >
            <div
              className="rounded-2xl border"
              style={{
                backgroundColor: colors.secondaryBackground,
                borderColor: colors.border,
                padding: spacing.sm,
              }}
            >
              <p
                className={`text-lg sm:text-xl ${typography.heading}`}
                style={{ color: colors.text }}
              >24</p>
              <p
                className={`${typography.small} font-medium`}
                style={{ color: colors.secondaryText }}
              >Posts</p>
            </div>
            <div
              className="rounded-2xl border"
              style={{
                backgroundColor: colors.secondaryBackground,
                borderColor: colors.border,
                padding: spacing.sm,
              }}
            >
              <p
                className={`text-lg sm:text-xl ${typography.heading}`}
                style={{ color: colors.text }}
              >1.4k</p>
              <p
                className={`${typography.small} font-medium`}
                style={{ color: colors.secondaryText }}
              >Followers</p>
            </div>
            <div
              className="rounded-2xl border"
              style={{
                backgroundColor: colors.secondaryBackground,
                borderColor: colors.border,
                padding: spacing.sm,
              }}
            >
              <p
                className={`text-lg sm:text-xl ${typography.heading}`}
                style={{ color: colors.text }}
              >382</p>
              <p
                className={`${typography.small} font-medium`}
                style={{ color: colors.secondaryText }}
              >Following</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}