import { NullStr } from "../../../../models/nullable"
import './notificationItem.scss'
type Props = {
    id: number,
    name: string,
    image: NullStr,
    isRoundImage?: boolean,
    rightItemId: number,
    urlPath: string,
    rightItemName?: { String: string; Valid: boolean },
    rightItemImage?: { String: string; Valid: boolean },
    rightItemUrlPath?: { String: string; Valid: boolean },
    message?: { String: string; Valid: boolean },
}

const NotificationItem = ({ 
    id, image, isRoundImage = true, name, urlPath,
    rightItemId, rightItemName = { String: '', Valid: false },
    rightItemImage = { String: '', Valid: false },
    rightItemUrlPath = { String: '', Valid: false },
    message = { String: '', Valid: false }}: Props) => {
    return (
        <div className="item-container">
            <div className='post-author'>
                {image && image.Valid ? (
                    <img className={`image ${isRoundImage ? 'border-radius-circle' : 'border-radius-square'}`} src={image.String} alt="" />
                ) : (
                    <div className={`image ${isRoundImage ? 'border-radius-circle' : 'border-radius-square'}`}></div>
                )}
                <div>
                    <a className={`name header-20}`} href={`/${urlPath}/${id}`}>{name}</a>
                    {message && message.Valid ? (
                        <p className="notification-message text-12">{message.String}
                            {rightItemId !== -1 ? (
                                <a className="right-item-link" href={`/${rightItemUrlPath.String}/${rightItemId}`}>{rightItemName.String}</a>
                            ) : null}
                        </p>
                    ) : null}
                </div>
            </div>
            {rightItemImage && rightItemImage.Valid ? (
                <img className={`image border-radius-square`} src={rightItemImage.String} alt="" />
            ) : null}
        </div>
    )
}

export default NotificationItem