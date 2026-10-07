import { useState, useEffect, useRef } from "react"
import PostCard from "../components/PostCard"
import Button from "../components/Button"
import type { Post } from "../types"
import { colors, spacing, typography } from "../theme"
import { authFetch } from "../utils/api"
import {
  ChatIcon,
  CheckIcon,
  PencilSquareIcon,
  PlusIcon,
} from "../components/icons"

function Home() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const [posts, setPosts] = useState<Post[]>([])
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [postContent, setpostContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)
  const [username, setUsername] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      setError("No token found")
      setLoading(false)
      return
    }

    // GET PROFILE
    authFetch("http://localhost:5000/api/auth/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        
        setUsername(data.user.username)
      })
      .catch((error) => {
        console.error("Profile error:", error)
      })

    // GET POSTS
    authFetch("http://localhost:5000/api/posts", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch posts")
        }

        return response.json()
      })
      .then((data) => {
      
        setPosts(data.posts)
      })
      .catch((error) => {
        console.error("Get posts error:", error)
        setError("Unable to load posts")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  async function handleCreatePost() {
    if (postContent.trim() === "") {
      return
    }

    const token = localStorage.getItem("token")

    if (!token) {
      setError("No token found")
      return
    }

    setCreating(true)
    setError("")

    try {
      // EDIT POST
      if (editingPost) {
        const response = await authFetch(
          `http://localhost:5000/api/posts/${editingPost._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              content: postContent,
            }),
          }
        )

        const data = await response.json()

        if (!response.ok) {
          setError(data.message || "Failed to update post")
          return
        }

        setPosts((previousPosts) =>
          previousPosts.map((post) =>
            post._id === editingPost._id ? data.post : post
          )
        )

        setEditingPost(null)
        setpostContent("")

        return
      }

      // CREATE POST
      const response = await authFetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: postContent,
        }),
      })

      const data = await response.json()


      if (!response.ok) {
        setError(data.message || "Failed to create post")
        return
      }

      setPosts((previousPosts) => [
        data.post,
        ...previousPosts,
      ])

      setpostContent("")
    } catch (error) {
      console.error("Post error:", error)
      setError("Unable to connect to the server")
    } finally {
      setCreating(false)
    }
  }

  // DELETE POST
  async function handleDeletePost(id: string) {
    const token = localStorage.getItem("token")

    if (!token) {
      setError("No token found")
      return
    }

    setError("")

    try {
      const response = await authFetch(
        `http://localhost:5000/api/posts/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()


      if (!response.ok) {
        setError(data.message || "Failed to delete post")
        return
      }

      setPosts((previousPosts) =>
        previousPosts.filter((post) => post._id !== id)
      )
    } catch (error) {
      console.error("Delete post error:", error)
      setError("Unable to connect to the server")
    }
  }

  function handleEditPost(post: Post) {
    setEditingPost(post)
    setpostContent(post.content)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })

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
            />

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
              <PencilSquareIcon className="w-4 h-4 text-amber-600" />
              Editing post
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
            {username ? username.charAt(0).toUpperCase() : "U"}
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
                  <Button
                    variant="ghost"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                )}

                <Button
                  onClick={handleCreatePost}
                  disabled={creating}
                >
                  {creating ? (
                    editingPost ? "Updating..." : "Creating..."
                  ) : editingPost ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      Update Post
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-4 h-4" />
                      Create Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 mt-3">
            {error}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <h2
          className="text-lg font-bold tracking-tight flex items-center gap-2"
          style={{ color: colors.text }}
        >
          <span>Recent Updates</span>
        </h2>

        {loading ? (
          <div
            className="rounded-3xl p-8 border text-center"
            style={{
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            }}
          >
            <p
              className={typography.small}
              style={{ color: colors.secondaryText }}
            >
              Loading posts...
            </p>
          </div>
        ) : posts.length === 0 ? (
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
              <ChatIcon className="w-7 h-7" strokeWidth={1.5} />
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
                key={p._id}
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