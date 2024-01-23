import { MessageItem } from "../../../models/chat"
import AvatarNamePair from "../../Reusable/AvatarNamePair/AvatarNamePair"
import "./message.scss"

type Props = {
  message: MessageItem
  isAlignRight: boolean
  isGroup: boolean
}
const Message = ({ message, isAlignRight, isGroup }: Props) => {
  return (
    <div className={`message-container border-radius-5 ${isAlignRight ? "msg-right" : "msg-left"}`}>
      {isGroup && (
        <AvatarNamePair
          id={message.sender.id}
          name={`${message.sender.firstName} ${message.sender.lastName}`}
          image={message.sender.avatar}
          urlPath="profile"
        />
      )}

      <div className="header-20">{message.content}</div>
      <div className="message-sent text-12">{message.sentAT}</div>
    </div>
  )
}

export default Message
