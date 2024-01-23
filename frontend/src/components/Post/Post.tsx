import { useContext, useEffect, useState } from 'react';
import { Post } from '../../models/post';
import UserItem from '../Reusable/UserItem/UserItem';
import './post.scss'
import { sendNotification } from '../../api/chats';
import { MsgEvents } from '../../models/chat';
import { AuthContext } from '../../contexts/AuthContext';
import ErrorPage from '../ErrorPage/ErrorPage';

type Props = {
    id: string
}

const PostComponent = ({ id }: Props) => {
    const [post, setPost] = useState<Post | null>(null)
    const [likes, setLikes] = useState<number | 0>(0)
    const [fillColor, setFillColor] = useState('#838383');
    const [statusCode, setStatusCode] = useState<number>(200)
    const { user } = useContext(AuthContext)

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(`http://localhost:8080/post/${id}`, {
                    method: 'GET',
                    credentials: 'include'
                })

                if (response.ok) {
                    const json: Post = await response.json()
                    setPost(json)
                    setLikes(json?.likes ?? 0)
                    if (!json.isLikedByCurrUser) {
                        setFillColor('none');
                    }
                } else {
                    setStatusCode(response.status)
                }
            } catch (error) {
                setStatusCode(500)
                console.error('Error fetching post:', error)
            }
        })()
    }, [id])

    const setLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
        try {
            await fetch(`http://localhost:8080/post/${id}/like`, {
                method: 'POST',
                credentials: 'include'
            })

        } catch (error) {
            console.error(error);
        }
    }

    const toggleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (fillColor === '#838383') {
            setFillColor('none');
            setLikes(likes - 1);
        } else {
            setFillColor('#838383');
            setLikes(likes + 1);
            send(e)
        }

        setLike(e)
    }

    const send = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        try {
            sendNotification({
                id: 0,
                receiverID: post ? post.author.id : -1,
                data: {
                    type: 'like',
                    leftEntity: {
                        id: 0,
                        name: '',
                        image: { String: '', Valid: false }
                    },
                    rightEntity: {
                        id: 0,
                        name: '',
                        image: { String: '', Valid: false }
                    },
                    chatID: 0,
                    eventID: 0,
                    senderID: user.id,
                    groupID: 0,
                    postID: post ? post.id : -1,
                },
                isRead: false,
                timestamp: '',
            }, MsgEvents.EventSendNotification);
        } catch (error) {
            console.error(error)
        }
    }

    if (!post || statusCode !== 200) {
        return <ErrorPage statusCode={statusCode} />
    }

    return (
        <div className='post-wrapper'>
            <div className="post-main">
                {post.image !== null && post.image.Valid &&
                    <img className='post-image' src={post.image.String} alt="" />
                }
                <p className='post-title header-40'>
                    {post.title}
                </p>
                <p className='post-content header-20'>
                    {post.content}
                </p>
            </div>
            <div className='post-details'>
                <div className="post-details-upper">
                    <UserItem
                        id={post.author.id}
                        image={post.author.avatar}
                        authorName={`${post.author.firstName} ${post.author.lastName}`} />
                    <div className="post-created-at header-20">{post.createdAT}</div>
                </div>

                <div className='post-details-lower post-likes'>
                    <button className='like-btn' onClick={(e) => { toggleLike(e) }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
                            <path id="like-svg" d="M5.56335 17.3853L14.3153 25.6068C14.6398 25.9116 14.802 26.064 15 26.064C15.198 26.064 15.3602 25.9116 15.6847 25.6068L15.6847 25.6068L24.4367 17.3853C26.8819 15.0882 27.1788 11.3082 25.1223 8.65758L24.7356 8.15918C22.2753 4.98822 17.337 5.52002 15.6083 9.14206C15.3641 9.6537 14.6359 9.6537 14.3917 9.14206C12.663 5.52002 7.72465 4.98823 5.26443 8.15918L4.87773 8.65759C2.82118 11.3083 3.11813 15.0882 5.56335 17.3853Z"
                                stroke="#838383" fill={fillColor} />
                        </svg>
                    </button>
                    <p className='post-likes-amount header-20'>{likes}</p>
                </div>
            </div>
        </div>
    )
}


export default PostComponent