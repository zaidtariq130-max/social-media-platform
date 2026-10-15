export default function UserListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 pt-2" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-2.5 rounded-2xl animate-pulse">
          <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-slate-200 rounded w-28" />
            <div className="h-2.5 bg-slate-100 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}
