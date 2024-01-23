import { useContext } from "react"
import { Group } from "../../models/group"
import { sendNotification } from "../../api/chats";
import { MsgEvents } from "../../models/chat";
import { AuthContext } from "../../contexts/AuthContext";

type Props = {
    groupData: Group
}

const NonMemberView = ({groupData}:Props) => {

  const { user } = useContext(AuthContext)

  async function sendFollowingRequest(e: React.MouseEvent<HTMLButtonElement>) {
    try {
      const response = await fetch(
        `http://localhost:8080/group/${groupData.id}/request`, {
        method: 'POST',
        credentials: 'include'
      }
      )
      if (response.ok) {
        if (groupData?.isMember === -1){
          send(e)
        }
        window.location.reload()
      }
    } catch (error) {
      console.error("Error sending following request:", error);
    }
  }

  const send = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      sendNotification({
        id: 0,
        receiverID: groupData ? groupData.creator.id : -1,
        data: {
          type: 'joining',
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
          groupID: groupData.id,
          postID: 0,
        },
        isRead: false,
        timestamp: '',
      }, MsgEvents.EventSendNotification);
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="group-page-container with-privacy">
      <div className="group-header-container">
        {groupData.image.Valid ? (
          <img
            className="group-header-image"
            src={groupData.image.String}
            alt=""
          />) : (
          <div className="hidden-div"></div>
        )
        }
        <div>
          <p className="header-40">{groupData.name}</p>
        </div>
      </div>
      <p className="description-header header-20 border-top">Description</p>
      <p className="text-12">{groupData.description}</p>
      <div className="privacy-wrapper border-top">
        <p className="header-20">This group is private</p>
        <p className="text-12 text-gray">Follow this group to see their events and posts.</p>
        <button className="btn-1 btn-follow" onClick={(e) => {sendFollowingRequest(e)}}>{groupData.isMember===-1 ? "Follow": "Pending"}</button>
      </div>
    </div>
  )
}

export default NonMemberView