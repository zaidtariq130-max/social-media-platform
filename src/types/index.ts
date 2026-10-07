export interface Post {
  _id: string
  user: {
    _id: string
    username: string
    email: string
  }
  content: string
  createdAt: string
  updatedAt: string
}
