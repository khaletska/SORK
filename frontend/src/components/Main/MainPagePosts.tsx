import { useEffect, useState } from "react"
import "./mainPage.scss"
import { Post } from "../../models/post"
import PostItem from "../Reusable/PostItem/PostItem"

const MainPagePosts = () => {
    const [posts, setPosts] = useState<Post[] | null>(null)

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(`http://localhost:8080/posts`, {
                    method: 'GET',
                    credentials: 'include'
                })
                const json: Post[] = await response.json()
                setPosts(json)
            } catch (error) {
                console.log(`Error fetching posts:`, error)
            }
        })()
    }, [])

    if (!posts || posts.length === 0) {
        return (
            <div className="hidden-div"></div>
        )
    }

    return (
        <div>
            <p className="posts-header header-20 border-top">Posts</p>
            <div className="posts-list">
                {posts.map((post) => (
                    <PostItem key={`post-${post.id}`} post={post} />
                ))}
            </div>
        </div>
    )
}

export default MainPagePosts