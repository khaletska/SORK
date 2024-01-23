import { Notification } from '../../../../models/notification'
import NotificationItem from "./NotificationItem"

export enum NotificationType {
    followRequestPrivateProfile = 'following',
    followingPublicProfile = 'following_public',
    invitationToGroup = 'invitation',
    requestToJoinGroup = 'joining',
    groupEventCreated = 'newEvent',
    postLike = 'like',
    postComment = 'comment',
    chatMessage = 'chat'
}

interface Props {
    notifications: Notification[]
    handleNotifications: (notification: Notification) => void
}

const NotificationsList = ({ notifications, handleNotifications }: Props) => {
    const confirmReq = async (notification: Notification, handleNotifications: (notification: Notification) => void) => {
        try {
            const res = await fetch(`http://localhost:8080/notification/${notification.id}`, {
                method: 'POST',
                credentials: 'include'
            })
            if (res.ok) {
                handleNotifications(notification)
            }
        } catch (error) {
            console.error("Error during confirm notification", error)
        }
    }

    const deleteReq = async (notification: Notification, handleNotifications: (notification: Notification) => void) => {
        try {
            const res = await fetch(`http://localhost:8080/notification/${notification.id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            if (res.ok) {
                handleNotifications(notification)
            }
        } catch (error) {
            console.error("Error during deleting notification", error)
        }
    }

    return (
        <div className="pop-up-list">
            {notifications && notifications.length > 0 ? (
                notifications.map((item: Notification) => (
                    <div key={item.id}>
                        {item.data.type === NotificationType.followRequestPrivateProfile ? (
                            <div className="notification-item">
                                <NotificationItem
                                    id={item.data.leftEntity.id}
                                    name={item.data.leftEntity.name}
                                    image={item.data.leftEntity.image}
                                    urlPath="profile"
                                    message={{ String: 'sent follow request', Valid: true }}
                                    rightItemId={-1} />
                                <div className="notification-btns">
                                    <button className="notification-btn confirm-btn header-20" onClick={e => (confirmReq(item, handleNotifications))}>
                                        Confirm
                                    </button>
                                    <button className="notification-btn btn-1 header-20" onClick={e => (deleteReq(item, handleNotifications))}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ) : item.data.type === NotificationType.followingPublicProfile ? (
                            <div className="notification-item">
                                <NotificationItem
                                    id={item.data.leftEntity.id}
                                    name={item.data.leftEntity.name}
                                    image={item.data.leftEntity.image}
                                    urlPath="profile"
                                    message={{ String: 'started following you.', Valid: true }}
                                    rightItemId={-1} />
                            </div>
                        ) : item.data.type === NotificationType.invitationToGroup ? (
                            <div className="notification-item">
                                <NotificationItem
                                    id={item.data.leftEntity.id}
                                    name={item.data.leftEntity.name}
                                    image={item.data.leftEntity.image}
                                    urlPath="profile"
                                    message={{ String: 'sent you an invitation to the ', Valid: true }}
                                    rightItemId={item.data.rightEntity.id}
                                    rightItemName={{ String: `${item.data.rightEntity.name}`, Valid: true }}
                                    rightItemUrlPath={{ String: 'group', Valid: true }} />
                                <div className="notification-btns">
                                    <button className="notification-btn confirm-btn header-20" onClick={e => (confirmReq(item, handleNotifications))}>
                                        Confirm
                                    </button>
                                    <button className="notification-btn btn-1 header-20" onClick={e => (deleteReq(item, handleNotifications))}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ) : item.data.type === NotificationType.requestToJoinGroup ? (
                            <div className="notification-item">
                                <NotificationItem
                                    id={item.data.leftEntity.id}
                                    name={item.data.leftEntity.name}
                                    image={item.data.leftEntity.image}
                                    urlPath="profile"
                                    message={{ String: 'sent a request to join ', Valid: true }}
                                    rightItemId={item.data.rightEntity.id}
                                    rightItemName={{ String: `${item.data.rightEntity.name}`, Valid: true }}
                                    rightItemUrlPath={{ String: 'group', Valid: true }} />
                                <div className="notification-btns">
                                    <button className="notification-btn confirm-btn header-20" onClick={e => (confirmReq(item, handleNotifications))}>
                                        Confirm
                                    </button>
                                    <button className="notification-btn btn-1 header-20" onClick={e => (deleteReq(item, handleNotifications))}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ) : item.data.type === NotificationType.groupEventCreated ? (
                            <div className="notification-item">
                                <NotificationItem
                                    id={item.data.rightEntity.id} // // TODO change it to event id
                                    name={item.data.leftEntity.name}
                                    image={item.data.leftEntity.image}
                                    isRoundImage={false}
                                    urlPath="group" // TODO change it to event
                                    message={{ String: 'new event in ', Valid: true }}
                                    rightItemId={item.data.rightEntity.id}
                                    rightItemName={{ String: `${item.data.rightEntity.name}`, Valid: true }}
                                    rightItemImage={item.data.rightEntity.image.Valid ? { String: `${item.data.rightEntity.image.String}`, Valid: true } : { String: '', Valid: false }}
                                    rightItemUrlPath={{ String: 'group', Valid: true }} />
                            </div>
                        ) : item.data.type === NotificationType.postLike ? (
                            <div className="notification-item">
                                <NotificationItem
                                    id={item.data.leftEntity.id}
                                    name={item.data.leftEntity.name}
                                    image={item.data.leftEntity.image}
                                    urlPath="profile"
                                    message={{ String: 'liked your post ', Valid: true }}
                                    rightItemId={item.data.rightEntity.id}
                                    rightItemName={{ String: `${item.data.rightEntity.name}`, Valid: true }}
                                    rightItemImage={item.data.rightEntity.image.Valid ? { String: `${item.data.rightEntity.image.String}`, Valid: true } : { String: '', Valid: false }}
                                    rightItemUrlPath={{ String: 'post', Valid: true }} />
                            </div>
                        ) : item.data.type === NotificationType.postComment ? (
                            <div className="notification-item">
                                <NotificationItem
                                    id={item.data.leftEntity.id}
                                    name={item.data.leftEntity.name}
                                    image={item.data.leftEntity.image}
                                    urlPath="profile"
                                    message={{ String: 'commented your post ', Valid: true }}
                                    rightItemId={item.data.rightEntity.id}
                                    rightItemName={{ String: `${item.data.rightEntity.name}`, Valid: true }}
                                    rightItemImage={item.data.rightEntity.image.Valid ? { String: `${item.data.rightEntity.image.String}`, Valid: true } : { String: '', Valid: false }}
                                    rightItemUrlPath={{ String: 'post', Valid: true }} />
                            </div>
                        ) : (
                            // Render content for other cases
                            <div>Something wrong with notification</div>
                        )}
                    </div>
                ))
            ) : (
                <div className="no-notifications">
                    No notifications yet.
                </div>
            )}
        </div>
    )
}

export default NotificationsList