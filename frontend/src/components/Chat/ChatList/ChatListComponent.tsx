import { ChatModel } from "../../../models/chat"
import ChatListItem from "./ChatListItem"
import "../../Reusable/AvatarNamePair/avatarNamePair.scss"

type Props = {
  chatsList: ChatModel[]
  action: (value: ChatModel) => void
}

const ChatListComponent = ({ chatsList, action }: Props) => {
  return (
    <div className="chat-list">
      {chatsList.map((chat) => (
        <ChatListItem key={`chats-${chat.isGroup ? 'group' : 'private'}-${chat.id}`} chatItem={chat} action={action} />
      ))}
    </div>
  )
}

export default ChatListComponent
