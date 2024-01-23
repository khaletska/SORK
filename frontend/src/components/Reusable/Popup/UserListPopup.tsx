import { useContext, useEffect, useState } from "react"
import Popup from "reactjs-popup"
import AddToCloseFriends from "./FollowersInteractions/AddToCloseFriends"
import DeleteFollows from "./FollowersInteractions/DeleteFollows"
import "./userListPopup.scss"
import UserItem from "../UserItem/UserItem"
import { sendNotification } from "../../../api/chats"
import { MsgEvents } from "../../../models/chat"
import { AuthContext } from "../../../contexts/AuthContext"
import PopUpHeader from "./PopUpHeader"
import SvgAddFavorite from "../../assets/SvgAddFavorite"
import { User, Follower } from "../../../models/user";

type Props = {
  title: string
  items: User[] | Follower[]
  friends?: number[]
  buttonTitle?: string
  buttonTypeClass?: string
  groupID?: number
  interactions?: boolean
  onClose: () => void
}

const UserListPopup = ({
  title,
  items,
  friends,
  buttonTitle = "Remove",
  buttonTypeClass = "btn-2",
  groupID = 0,
  interactions = false,
  onClose,
}: Props) => {
  const [popup, setPopup] = useState(false)
  const [updatedItems, setItems] = useState(items)
  const [updatedFriends, setFriends] = useState(friends)
  const { user } = useContext(AuthContext)

  const closePopup = () => {
    setPopup(false)
    onClose()
  }

  const handleDelete = (id: number) => {
    setItems(updatedItems.filter((item) => item.id !== id))
  }

  const handleFriends = (id: number) => {
    setFriends(updatedFriends ? [...updatedFriends, id] : [id])
  }

  async function handleInvite(e: React.MouseEvent<HTMLButtonElement>, userID: number) {
    try {
      const response = await fetch(`http://localhost:8080/group/${groupID}/invite`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "appliction/json" },
        body: JSON.stringify({
          id: userID,
        }),
      })
      if (!response.ok) {
        alert("Something went with submitting the invite to group request. Please try again soon.")
      } else {
        // TODO send
        send(e, userID)
        handleDelete(userID)
      }
    } catch (err) {
      alert("Something went with submitting the invite to group request. Please try again soon.")
    }
  }

  useEffect(() => {
    setItems(items)
    setFriends(friends)
  }, [items, friends])

  const send = async (event: React.MouseEvent<HTMLButtonElement>, userID: number) => {
    event.preventDefault()
    try {
      sendNotification(
        {
          id: 0,
          receiverID: userID,
          data: {
            type: "invitation",
            leftEntity: {
              id: 0,
              name: "",
              image: { String: "", Valid: false },
            },
            rightEntity: {
              id: 0,
              name: "",
              image: { String: "", Valid: false },
            },
            chatID: 0,
            eventID: 0,
            senderID: user ? user.id : -1,
            groupID: groupID,
            postID: 0,
          },
          isRead: false,
          timestamp: "",
        },
        MsgEvents.EventSendNotification
      )
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <button
        className={`friends-btn ${buttonTypeClass} header-20`}
        onClick={() => setPopup((o) => !o)}
      >
        {title}
      </button>
      <Popup open={popup} onClose={closePopup}>
        <div className="pop-up-container">
          <div className="pop-up">
            <div className="pop-up-content">
              <PopUpHeader title={title} closePopup={closePopup} />
              <div className="pop-up-list border-top">
                {updatedItems && updatedItems.length > 0 ? (
                  updatedItems.map((item: User| Follower) => (
                    <div className="follower-item" key={`follower-${item.id}`}>
                      <UserItem
                        id={item.id}
                        authorName={`${item.firstName} ${item.lastName}`}
                        image={item.avatar}
                      />
                      {interactions &&
                        <div className="following-popup-buttons">
                          {updatedFriends && !updatedFriends.includes(item.id) && (
                            <button
                              className="make-friend-btn"
                              onClick={(e) => AddToCloseFriends(item.id, handleFriends)}
                            >
                              <SvgAddFavorite />
                            </button>
                          )}
                          {buttonTitle === "Invite" ? (
                            <button
                              className="invite-to-group-btn btn-1 header-20"
                              onClick={(e) => handleInvite(e, item.id)}
                            >
                              {buttonTitle}
                            </button>
                          ) : (
                            <button
                              className="remove-follower-btn btn-1 header-20"
                              onClick={(e) => DeleteFollows(item.id, title, handleDelete)}
                            >
                              {buttonTitle}
                            </button>
                          )}
                        </div>
                      }
                    </div>
                  ))
                ) : (
                  <div className="no-followers">{`No ${title === "Invite" ? "one to" : ""} ${title.toLowerCase()} yet.`}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Popup>
    </div>
  )
}
export default UserListPopup
