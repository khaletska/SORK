import { Post } from "../../models/post"
import PostItem from "../Reusable/PostItem/PostItem"

type Props = {
    postData: Post[]|undefined
}

const GroupPostsComponent = ({postData}:Props) => {
    if (!postData) {

        return (
            <div>
                <p>Unable to load posts. Try again later.</p>
            </div>
        )
    }

    return (
        <div className="group-posts-container">
        <p className="header-20 posts-header">Posts</p>
        <div className="post-cards-list">
            {postData.length > 0 ? (
            postData.map((post) => (
                <div key={`post-${post.id}`}>
                <PostItem post={post} isWide={true} ></PostItem> 
                </div>
            ))
            ) : (
            <div className="no-posts">
                <p className="header-20">No posts yet. Create first post!</p>
            </div>
            )}
        </div>
        </div>
    )
}

export default GroupPostsComponent