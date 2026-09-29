import type { Post } from "../types"
import Button from "../components/Button"

interface postprops {
  post: Post
  onDelete: (id: number) => void
  onEdit: (post: Post) => void
}

export default function PostCard({ post, onDelete, onEdit }: postprops) {
  const formattedDate = (() => {
    try {
      const d = new Date(post.createdAt)
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      }
    } catch {
      // fallback
    }
    return post.createdAt
  })()

  return (
    <article className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm ring-2 ring-blue-50 shrink-0">
            {post.username ? post.username.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{post.username}</span>
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                #{post.id}
              </span>
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formattedDate}</span>
            </p>
          </div>
        </div>
      </div>

      <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap break-words">
        {post.content}
      </p>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
        <Button
          variant="secondary"
          onClick={() => onEdit(post)}
          className="text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit
        </Button>
        <Button
          variant="danger"
          onClick={() => onDelete(post.id)}
          className="text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </Button>
      </div>
    </article>
  )
}
