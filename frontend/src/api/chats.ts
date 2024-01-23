import { ChatModel, MessageItem, MsgEvents } from "../models/chat"
import { Notification } from "../models/notification"

export var socket: WebSocket | undefined = undefined

export class wsEvent {
  type: string
  payload: {
    msg?: MessageItem | null
    chat?: { id: number; isGroup: boolean } | null
    notification?: Notification | null
  }

  constructor(type: string, notification: Notification)
  constructor(type: string, msg: MessageItem, chat: ChatModel)
  constructor(type: string, arg1?: MessageItem | Notification, arg2?: ChatModel) {
    this.type = type
    if (this.type === MsgEvents.EventSendMessage || this.type === MsgEvents.EventReceiveMessage) {
      this.payload = {
        msg: arg1 as MessageItem,
        chat: arg2 ? { id: arg2.id, isGroup: arg2.isGroup } : null,
      }
    } else if (
      this.type === MsgEvents.EventSendNotification ||
      this.type === MsgEvents.EventReceiveNotification
    ) {
      this.payload = {
        notification: arg1 as Notification,
      }
    } else {
      throw new Error("Invalid arguments")
    }
  }
}

let connect = () => {
  if (socket?.readyState === WebSocket.CONNECTING || socket?.readyState === WebSocket.OPEN) {
    return
  }
  socket = new WebSocket("ws://localhost:8080/chats")
  console.log("connecting")

  socket.onopen = () => {
    console.log("successfully connected")
  }

  socket.onmessage = (e: any) => {
    const eventData = JSON.parse(e.data)
    var evt: wsEvent
    if (eventData.type.includes("message")) {
      evt = new wsEvent(eventData.type, eventData.payload.msg, eventData.payload.chat)
    } else {
      evt = new wsEvent(eventData.type, eventData.payload.notification)
    }
    routeEvent(evt)
  }

  socket.onclose = (e: CloseEvent) => {
    console.log("socket closed: ", e)
  }

  socket.onerror = (err: Event) => {
    console.log("socket error: ", err)
  }

  return () => {
    console.log("closing socket")
    socket?.close()
  }
}

let sendMsg = (event: wsEvent) => {
  socket && socket.send(JSON.stringify(event))
}

let sendNotification = (notification: Notification, type: MsgEvents) => {
  const event = new wsEvent(type, notification)
  socket && socket.send(JSON.stringify(event))
}

function routeEvent(event: wsEvent) {
  if (event.type === undefined) {
    alert("no 'type' in event")
  }
  switch (event.type) {
    case "receive_message":
      const msgEvent = new CustomEvent("receive_message", {
        detail: event.payload,
      })

      document.dispatchEvent(msgEvent)

      // receiveMessage(event.payload)
      break
    case "receive_notif":
      const notificationEvent = new CustomEvent("receive_notif", {
        detail: event.payload,
      })

      document.dispatchEvent(notificationEvent)
      break
    default:
      const ChatErrorEvent = new CustomEvent("ChatSendingError", {
        detail: event.payload
      })

      document.dispatchEvent(ChatErrorEvent)
      // alert("unsupported message type")
      break
  }
}

export { connect, sendMsg, sendNotification }
