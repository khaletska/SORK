import { useContext, useEffect, useState } from "react"
import "./notifications.scss"
import "../../../Menu/menu.scss"
import "../../../../app.scss"
import Popup from "reactjs-popup"
import { Notification } from "../../../../models/notification"
import NotificationsList from "./NotificationsList"
import SvgNotificationBell from "../../../assets/SvgNotificationBell"
import { NotificationType } from "./NotificationsList"
import { AuthContext } from "../../../../contexts/AuthContext"

const NotificationsPopup = () => {
  const [popup, setPopup] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([])
  const [readNotifications, setReadNotifications] = useState<Notification[]>([])
  const [bubleNumber, setBubleNumber] = useState<number>(0)
  const { setChatBubbleNumber } = useContext(AuthContext)

  const closePopup = () => {
    setPopup(false)
    updateSeenNotifications()
  }
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`http://localhost:8080/notifications`, {
          method: "GET",
          credentials: "include",
        })
        const data = await response.json()
        const unreads: Notification[] = []
        const reads: Notification[] = []
        let chatNotifCounter = 0

        data?.forEach((notification: Notification) => {
          if (notification.data.type !== NotificationType.chatMessage) {
            if (notification.isRead) {
              reads.push(notification)
            } else {
              unreads.push(notification)
            }
          } else if (notification.data.type === "chat") {
            if (!notification.isRead) {
              chatNotifCounter++
            }
          }
        })

        setChatBubbleNumber(chatNotifCounter)
        setUnreadNotifications(unreads.reverse())
        setBubleNumber(unreads?.length)
        setReadNotifications(reads.reverse())
        document.addEventListener("receive_notif", (e: any) => {
          if (e.detail.notification.data.type !== NotificationType.chatMessage) {
            setBubleNumber((prevBubleNumber) => prevBubleNumber + 1)
          }
        })
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    })()
  }, [bubleNumber])
  const togglePopup = async () => {
    setPopup((o) => !o)
    try {
      await fetch(`http://localhost:8080/notifications/seen`, {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Error during notifications seen", error)
    }
  }
  const handleNotifications = (notification: Notification) => {
    const updatedNotifications = unreadNotifications.filter((item) => item !== notification)
    setUnreadNotifications(updatedNotifications)
  }
  const updateSeenNotifications = () => {
    let noResponseNotificationTypes: string[] = [
      NotificationType.groupEventCreated,
      NotificationType.postLike,
      NotificationType.postComment,
      NotificationType.followingPublicProfile,
    ]
    unreadNotifications.forEach((n, index) => {
      if (noResponseNotificationTypes.includes(n.data.type)) {
        unreadNotifications[index].isRead = true
        readNotifications.push(unreadNotifications[index])
      }
    })
    setReadNotifications(readNotifications)
    let newunreadList: Notification[] = []
    unreadNotifications.forEach((notification: Notification) => {
      if (!notification.isRead) {
        newunreadList.push(notification)
      }
    })
    setUnreadNotifications(newunreadList)
    setBubleNumber(newunreadList.length)
  }
  console.log(bubleNumber)
  return (
    <div>
      <button className="menu-item notifications-btn" onClick={togglePopup}>
        <div className="bell-container">
          <SvgNotificationBell />
          {bubleNumber > 0 ? <div className="bubble">{bubleNumber}</div> : null}
        </div>
        <span className="header-20 btn-span">Notifications</span>
      </button>
      <Popup open={popup} onClose={closePopup}>
        <div className="pop-up-container">
          <div className="pop-up">
            <div className="pop-up-content">
              <div className="pop-up-header">
                <div className="popup-title">Notifications</div>
                <svg
                  className="close"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="25"
                  viewBox="0 0 24 25"
                  fill="none"
                  onClick={closePopup}
                >
                  <path
                    d="M18 6.88818L6 18.8882"
                    stroke="#222222"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 6.88818L18 18.8882"
                    stroke="#222222"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="pop-up-list border-top">
                {unreadNotifications.length === 0 && readNotifications.length === 0 ? (
                  <div className="no-notifications">No notifications yet.</div>
                ) : unreadNotifications.length === 0 ? (
                  <div className="no-notifications">No new notifications.</div>
                ) : (
                  <NotificationsList
                    notifications={unreadNotifications}
                    handleNotifications={handleNotifications}
                  />
                )}
                {readNotifications.length > 0 ? (
                  <div className="pop-up-list border-top">
                    <p>Previous</p>
                    <NotificationsList
                      notifications={readNotifications}
                      handleNotifications={handleNotifications}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Popup>
    </div>
  )
}
export default NotificationsPopup
