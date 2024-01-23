import { NullStr } from "./nullable"
import { User } from "./user"

export type ChatItemModel = {
  id: number
  name: string
  image: NullStr
}

export type ChatModel = {
  id: number
  isGroup: boolean
  chatName: ChatItemModel
  chatHistory: MessageItem[]
  currUser: User
}

export type MessageItem = {
  id: number
  chatID: number
  type: string
  // chatName: NullStr,
  sender: User
  content: string
  sentAT: string
  receiverID?: number
}

export enum MsgEvents {
  //receiving events
  EventReceiveMessage = "receive_message",
  EventReceiveNotification = "receive_notif",

  //sending events
  EventSendMessage = "send_message",
  EventSendNotification = "send_notif",
}
