import { ChatModel } from "../../../models/chat"
import "../../Reusable/AvatarNamePair/avatarNamePair.scss"

type Props = {
  chatItem: ChatModel
  action: (value: ChatModel) => void
}

const ChatListItem = ({ chatItem, action }: Props) => {
  return (
    <div className="post-author chat-item-container border-top" onClick={() => action(chatItem)}>
      {chatItem.chatName.image && chatItem.chatName.image.Valid ? (
        <img
          className={`avatar ${chatItem.isGroup ? "border-radius-5" : "border-radius-15"}`}
          src={chatItem.chatName.image.String}
          alt=""
        />
      ) : (
        <div
          className={`avatar ${chatItem.isGroup ? "border-radius-5" : "border-radius-15"}`}
        ></div>
      )}
      <p className="chat-name text-12">{chatItem.chatName.name}</p>
    </div>
  )
}

export default ChatListItem
