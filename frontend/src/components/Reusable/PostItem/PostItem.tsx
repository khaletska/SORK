import { Post } from "../../../models/post"
import './postItem.scss'

type Props = {
    post: Post,
    //for group page where post items are in one row
    isWide?: boolean,
}

const PostItem = ({post, isWide = false}: Props) => {
    return (
        <a className={isWide ? "post-item-wide": "post-item"} href={`/post/${post.id}`} key={`post-${post.id}`}>
            <div className="post-item-text">
                <p className="post-created-at text-12">{post.createdAT}</p>
                <p className="text-clip-elipsis header-20">{post.title}</p>
            </div>
            {post.image.Valid ? (
                <img className='post-item-image' src={post.image.String} alt="" />
            ) : (
                <div className='post-item-image'></div>
            )}
            <div className="post-item-read-more text-12">
                <span>Read more</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 6" fill="none">
                    <path d="M9 3L9.17678 2.82322L9.35355 3L9.17678 3.17678L9 3ZM1 3.25C0.861929 3.25 0.75 3.13807 0.75 3C0.75 2.86193 0.861929 2.75 1 2.75V3.25ZM7.17678 0.823223L9.17678 2.82322L8.82322 3.17678L6.82322 1.17678L7.17678 0.823223ZM9.17678 3.17678L7.17678 5.17678L6.82322 4.82322L8.82322 2.82322L9.17678 3.17678ZM9 3.25H1V2.75H9V3.25Z" fill="#222222" />
                </svg>
            </div>
        </a>
    )
}

export default PostItem