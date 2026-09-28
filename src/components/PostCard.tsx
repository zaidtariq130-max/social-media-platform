import type { Post} from "../types"
import Button from "../components/Button"
interface postprops{
        post:Post;
        onDelete:(id:number)=>void
        onEdit:(post:Post)=>void
    }
export default function PostCard({post,onDelete,onEdit}:postprops) {
  return (
    <div><h3>{post.id} {post.username}</h3>
         <p>{post.content}</p>
         <p>{post.createdAt}</p>
      <Button onClick={()=>onDelete(post.id)}>Delete</Button>
      <Button onClick={()=>onEdit(post)}>Edit</Button>
   </div>
  )
}
