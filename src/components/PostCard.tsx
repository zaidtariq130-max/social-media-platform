import type { Post } from "../types"
import Button from "../components/Button"
import { colors, spacing, typography } from "../theme"
import { ClockIcon, EditIcon, TrashIcon } from "./icons"

interface postprops {
  post: Post
  onDelete: (id: string) => void
  onEdit: (post: Post) => void
}

export default function PostCard({
  post,
  onDelete,
  onEdit,
}: postprops) {
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
      // Keep original date if formatting fails
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
            {post.user.username
              ? post.user.username.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div>
            <h3
              className={`text-base ${typography.heading} flex items-center gap-2`}
              style={{ color: colors.text }}
            >
              <span>{post.user.username}</span>

              <span
                className={`${typography.small} font-normal px-2 py-0.5 rounded-full`}
                style={{
                  backgroundColor: colors.secondaryBackground,
                  color: colors.secondaryText,
                }}
              >
                #{post._id}
              </span>
            </h3>

            <p
              className={`${typography.small} flex items-center gap-1.5 mt-0.5`}
              style={{ color: colors.secondaryText }}
            >
              <ClockIcon className="w-3.5 h-3.5" />
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
          <EditIcon className="w-3.5 h-3.5" />
          Edit
        </Button>

        <Button
          variant="danger"
          onClick={() => onDelete(post._id)}
          className={`${typography.small} py-1.5 sm:py-2 px-3 sm:px-4`}
        >
          <TrashIcon className="w-3.5 h-3.5" />
          Delete
        </Button>
      </div>
    </article>
  )
}

