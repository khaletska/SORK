import { NullStr } from "../../../models/nullable"
import './userItem.scss'

type Props = {
    id: number,
    authorName: string,
    image: NullStr,
    //small text is 12px, default is 20px
    isSmallText?: boolean,
}

const UserItem = ({id, image, authorName, isSmallText = false}: Props) => {
    return (
        <a className='post-author' href={`/profile/${id}`}>
            {image && image.Valid ? (
                <img className='post-author-avatar' src={image.String} alt="" />
            ) : (
                <div className='post-author-avatar'></div>
            )}
            <p className= {`post-author-name ${isSmallText? 'text-12': 'header-20'}`}>{authorName}</p>
        </a>
    )
}

export default UserItem