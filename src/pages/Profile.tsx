import userProfileIcon from "../assets/user-profile-icon.svg"

export default function Profile() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Banner Cover */}
        <div className="h-32 sm:h-44 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 relative">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1.5">
            <img
              src={userProfileIcon}
              alt="Profile"
              className="w-3.5 h-3.5 object-contain brightness-0 invert"
            />
            <span>Active Member</span>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
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

          {/* User Details */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Zaid
              </h2>
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs" title="Verified">
                ✓
              </span>
            </div>
            <p className="text-slate-500 text-sm sm:text-base flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>zaid@example.com</span>
            </p>
          </div>

          <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
            Frontend enthusiast & software engineer passionate about crafting delightful, modern user experiences.
          </p>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100 text-center">
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <p className="text-lg sm:text-xl font-bold text-slate-900">24</p>
              <p className="text-xs text-slate-500 font-medium">Posts</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <p className="text-lg sm:text-xl font-bold text-slate-900">1.4k</p>
              <p className="text-xs text-slate-500 font-medium">Followers</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <p className="text-lg sm:text-xl font-bold text-slate-900">382</p>
              <p className="text-xs text-slate-500 font-medium">Following</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}