import { useContext } from "react"
import { User } from "../../models/user"
import "./profile.scss"
import UserListPopup from "../Reusable/Popup/UserListPopup"
import EditProfilePopup from "../Reusable/Popup/EditProfilePopup"
import { sendNotification } from "../../api/chats"
import { MsgEvents } from "../../models/chat"
import { AuthContext } from "../../contexts/AuthContext"
import { ConnectionType } from "./ProfileRoute"
import { useNavigate } from "react-router-dom"

type Props = {
  connection: string | null
  fetchUser: User | null
  getUserInfo: any
  setUsersConnection: any
}

const ProfileInfo = ({ connection, fetchUser, getUserInfo, setUsersConnection }: Props) => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  // TODO change
  const handleChat = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    console.log("go to chat")
    navigate("/chats/" + fetchUser?.id)
    return
  }

  const updateConnection = async (
    isFollowAction: boolean,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault()
    let method = ""
    if (isFollowAction) {
      if (fetchUser?.isPublic) {
        setUsersConnection(ConnectionType.friends)
      } else {
        setUsersConnection(ConnectionType.pending)
      }
      method = "POST"
    } else {
      setUsersConnection("nobody")
      method = "DELETE"
      window.location.reload()
    }

    try {
      const res = await fetch(`http://localhost:8080/profile/${fetchUser?.id}/request`, {
        method: method,
        credentials: "include",
      })

      if (res.ok && isFollowAction) {
        send(e)
      }
    } catch (error) {
      console.error("Request failed with status:", error)
    }
  }

  const send = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    try {
      sendNotification(
        {
          id: 0,
          receiverID: fetchUser ? fetchUser.id : -1,
          data: {
            type: fetchUser?.isPublic ? "following_public" : "following",
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
            groupID: 0,
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

  if (!fetchUser) {
    // TODO: handle the case when we don't have user for some reason
    // probably 404
    return <div className="hidden-div"></div>
  }

  return (
    <div className="user-info-wrapper">
      <div className="user-basic-container">
        <div className="user-basic">
          {fetchUser.avatar.Valid ? (
            <img className="user-avatar" src={fetchUser.avatar.String} alt="" />
          ) : (
            <div className="user-avatar"></div>
          )}
          <div className="user-details-edit">
            <div className="user-details">
              <p className="user-name header-40">{`${fetchUser.firstName} ${fetchUser.lastName}`}</p>
              {fetchUser.nickname.Valid && (
                <p className="user-nickname">
                  also known as <span className="nickname">{fetchUser.nickname.String}</span>
                </p>
              )}
              <div className="user-email-dob">
                <p className="user-email text-12">{fetchUser.email}</p>
                <p className="user-dob text-12">{fetchUser.dateOfBirth}</p>
              </div>
            </div>
            {connection === "currUser" ? (
              <EditProfilePopup user={fetchUser}></EditProfilePopup>
            ) : (
              <div>
                {connection === ConnectionType.friends || connection === ConnectionType.closeFriends  ? (
                  <div className="profile-btns">
                    <button
                      className="user-edit-profile-btn btn-1 header-20"
                      onClick={(e) => {
                        updateConnection(false, e)
                      }}
                    >
                      Unfollow
                    </button>
                    <button
                      className="user-edit-profile-btn btn-1 header-20"
                      onClick={(e) => {
                        handleChat(e)
                      }}
                    >
                      Chat
                    </button>
                  </div>
                ) : connection === ConnectionType.pending ? (
                  <button
                    className="user-edit-profile-btn btn-1 header-20"
                    onClick={(e) => {
                      updateConnection(false, e)
                    }}
                  >
                    Pending
                  </button>
                ) : (
                  <button
                    className="user-edit-profile-btn btn-1 header-20"
                    onClick={(e) => {
                      updateConnection(true, e)
                    }}
                  >
                    Follow
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="friends-btn-menu">
          <UserListPopup onClose={getUserInfo} title="Followers" items={fetchUser.followers} interactions={fetchUser.id === user.id} />
          <UserListPopup
            onClose={getUserInfo}
            title="Following"
            items={fetchUser.following}
            friends={fetchUser.friends ? fetchUser.friends.map((friend) => friend.id) : []}
            buttonTitle="Unfollow"
            interactions={fetchUser.id === user.id}
          />
          <UserListPopup onClose={getUserInfo} title="Close friends" items={fetchUser.friends} interactions={fetchUser.id === user.id} />
        </div>
      </div>
      {fetchUser.about.Valid && (
        <div className="user-about border-top">
          <p className="header-20">About</p>
          <p className="text-12">{fetchUser.about.String}</p>
        </div>
      )}
    </div>
  )
}

export default ProfileInfo
