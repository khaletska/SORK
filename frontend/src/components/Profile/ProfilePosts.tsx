import { Post } from "../../models/post"
import "./profile.scss"
import PostItem from "../Reusable/PostItem/PostItem"

type Props = {
  posts: Post[] | null
}

const ProfilePosts = ({ posts }: Props) => {
  if (!posts || posts.length === 0) {
    return <div className="hidden-div"></div>
  }

  return (
    <div className="user-posts-wrapper">
      <p className="header-20 border-top">Posts</p>
      <div className="posts-list">
        {posts.map((post) => (
          <PostItem post={post} key={`post-${post.id}`} />
        ))}
      </div>
    </div>
  )
}

export default ProfilePosts
