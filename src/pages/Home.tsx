import { useState,useEffect} from "react"
import PostCard from "../components/PostCard"
import Button from "../components/Button"
import type { Post } from "../types"

function Home() {
    const [posts, setPosts] = useState<Post[]>([])
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
                    p.id === editingPost.id
                        ? { ...p, content: postContent }
                        : p
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
            createdAt: new Date().toISOString()
        }

        setPosts((prepreviousPosts) => [
            ...prepreviousPosts,
            newPost
        ])

        setpostContent("")
    }

    function handleDeletePost(id: number) {
        setPosts((previousPosts) =>
            previousPosts.filter((p) => p.id !== id)
        )
    }

    function handleEditPost(post: Post) {
        setEditingPost(post)
        setpostContent(post.content)
    }

    return (
        <div>
            <h1>Home Page</h1>

            <textarea
                value={postContent}
                onChange={(e) => setpostContent(e.target.value)}
            />

            <Button onClick={handleCreatePost}>
                {editingPost ? "Update Post" : "Create Post"}
            </Button>

            {posts.map((p) => (
                <PostCard
                    key={p.id}
                    post={p}
                    onDelete={handleDeletePost}
                    onEdit={handleEditPost}
                />
            ))}
        </div>
    )
}

export default Home