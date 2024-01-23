import PostComponent from "./Post"
import CommentsComponent from "./Comments"
import { useParams } from 'react-router-dom';
import ErrorPage from "../ErrorPage/ErrorPage";

const PostRoute = () => {
    const { id } = useParams()

    if (!id) return <ErrorPage statusCode={404} />

    return (
        <div>
            <PostComponent id={id} />
            <CommentsComponent postID={id}/>
        </div>
    )
}

export default PostRoute