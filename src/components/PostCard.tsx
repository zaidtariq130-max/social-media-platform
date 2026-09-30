import type { Post } from "../types"
import Button from "../components/Button"
import { colors, spacing, typography } from "../theme"

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
      // fallback to raw date string
    }
    return post.createdAt
  })()

  return (
    <article
      className="rounded-2xl border shadow-xs hover:shadow-md transition-all duration-200 flex flex-col gap-4"
      style={{
        backgroundColor: colors.cardBackground,
        borderColor: colors.border,
        padding: spacing.lg,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center text-sm shadow-sm ring-2 ring-blue-50 shrink-0"
            style={{ backgroundColor: colors.primary }}
          >
            {post.username ? post.username.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h3
              className={`text-base ${typography.heading} flex items-center gap-2`}
              style={{ color: colors.text }}
            >
              <span>{post.username}</span>
              <span
                className={`${typography.small} font-normal px-2 py-0.5 rounded-full`}
                style={{
                  backgroundColor: colors.secondaryBackground,
                  color: colors.secondaryText,
                }}
              >
                #{post.id}
              </span>
            </h3>
            <p
              className={`${typography.small} flex items-center gap-1.5 mt-0.5`}
              style={{ color: colors.secondaryText }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formattedDate}</span>
            </p>
          </div>
        </div>
      </div>

      <p
        className={`text-base ${typography.body} leading-relaxed whitespace-pre-wrap break-words`}
        style={{ color: colors.secondaryText }}
      >
        {post.content}
      </p>

      <div
        className="flex items-center justify-end gap-2.5"
        style={{
          paddingTop: spacing.sm,
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <Button
          variant="secondary"
          onClick={() => onEdit(post)}
          className={`${typography.small} py-1.5 sm:py-2 px-3 sm:px-4`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit
        </Button>
        <Button
          variant="danger"
          onClick={() => onDelete(post.id)}
          className={`${typography.small} py-1.5 sm:py-2 px-3 sm:px-4`}
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
