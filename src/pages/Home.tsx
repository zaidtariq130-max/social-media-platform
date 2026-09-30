import { useState, useEffect, useRef } from "react"
import PostCard from "../components/PostCard"
import Button from "../components/Button"
import type { Post } from "../types"
import { colors, spacing, typography } from "../theme"

function Home() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem("posts")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [postContent, setpostContent] = useState("")

  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts))
  }, [posts])

  function handleCreatePost() {
    if (postContent.trim() === "") {
      return
    }

    if (editingPost) {
      setPosts((previousPosts) =>
        previousPosts.map((p) =>
          p.id === editingPost.id ? { ...p, content: postContent } : p
        )
      )

      setEditingPost(null)
      setpostContent("")
      return
    }

    const newPost: Post = {
      id: Date.now(),
      username: "Zaid",
      content: postContent,
      createdAt: new Date().toISOString(),
    }

    setPosts((previousPosts) => [...previousPosts, newPost])
    setpostContent("")
  }

  function handleDeletePost(id: number) {
    setPosts((previousPosts) => previousPosts.filter((p) => p.id !== id))
  }

  function handleEditPost(post: Post) {
    setEditingPost(post)
    setpostContent(post.content)
    window.scrollTo({ top: 0, behavior: "smooth" })
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }

  function handleCancelEdit() {
    setEditingPost(null)
    setpostContent("")
  }

  return (
    <div
      className="space-y-6 sm:space-y-8"
      style={{
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            style={{ color: colors.text }}
          >
            Home Feed
          </h1>

          <p
            className={`${typography.small} mt-0.5`}
            style={{ color: colors.secondaryText }}
          >
            Share what's on your mind and interact with recent posts.
          </p>
        </div>

        <div className="self-start sm:self-auto">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
            style={{
              backgroundColor: colors.activeBackground,
              color: colors.primary,
              borderColor: colors.activeBorder,
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: colors.primary }}
            ></span>

            {posts.length} {posts.length === 1 ? "Post" : "Posts"}
          </span>
        </div>
      </div>

      <div
        className="rounded-3xl p-5 sm:p-6 border shadow-xs focus-within:shadow-md transition-all duration-200"
        style={{
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          paddingTop: spacing.md,
          paddingBottom: spacing.md,
        }}
      >
        {editingPost && (
          <div className="mb-3 flex items-center justify-between bg-amber-50 text-amber-800 border border-amber-200/80 px-3.5 py-2 rounded-xl text-xs sm:text-sm">
            <span className="font-medium flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>

              Editing post #{editingPost.id}
            </span>

            <button
              onClick={handleCancelEdit}
              className="text-amber-700 hover:text-amber-900 font-semibold cursor-pointer underline ml-2"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex gap-3 sm:gap-4">
          <div
            className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center text-sm shadow-sm ring-2 ring-blue-50 shrink-0"
            style={{ backgroundColor: colors.primary }}
          >
            Z
          </div>

          <div className="flex-1 space-y-3">
            <textarea
              ref={textareaRef}
              value={postContent}
              onChange={(e) => setpostContent(e.target.value)}
              placeholder="What's happening? Share your thoughts..."
              rows={3}
              className="w-full p-3 sm:p-4 text-slate-800 placeholder-slate-400 bg-slate-50/70 border rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm sm:text-base resize-none"
              style={{ borderColor: colors.border }}
            />

            <div className="flex items-center justify-between pt-1">
              <span
                className={typography.small}
                style={{ color: colors.secondaryText }}
              >
                {postContent.length > 0 &&
                  `${postContent.length} characters`}
              </span>

              <div className="flex items-center gap-2">
                {editingPost && (
                  <Button variant="ghost" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                )}

                <Button onClick={handleCreatePost}>
                  {editingPost ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Update Post
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Create Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2
          className="text-lg font-bold tracking-tight flex items-center gap-2"
          style={{ color: colors.text }}
        >
          <span>Recent Updates</span>
        </h2>

        {posts.length === 0 ? (
          <div
            className="rounded-3xl p-8 sm:p-12 border text-center flex flex-col items-center justify-center gap-3"
            style={{
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: colors.activeBackground,
                color: colors.iconActive,
              }}
            >
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>

            <h3
              className={`text-base ${typography.heading}`}
              style={{ color: colors.text }}
            >
              No posts yet
            </h3>

            <p
              className={`${typography.small} max-w-sm`}
              style={{ color: colors.secondaryText }}
            >
              Be the first to share an update! Type in the box above and click
              "Create Post".
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                onDelete={handleDeletePost}
                onEdit={handleEditPost}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home

