import { NullStr } from './nullable'

export type Notification = {
  id: number
  receiverID: number
  data: {
    type: string
    leftEntity: NotificationEntity
    rightEntity: NotificationEntity
    senderID: number
    eventID: number
    groupID: number
    postID: number
    chatID: number
  }
  isRead: Boolean
  timestamp: string
}

type NotificationEntity = {
  id: number
  name: string
  image: NullStr
}
