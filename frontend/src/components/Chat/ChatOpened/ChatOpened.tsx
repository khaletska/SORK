import { useContext, useEffect, useState } from "react"
import { sendMsg, wsEvent } from "../../../api/chats"
import ChatHistory from "./ChatHistory"
import ChatInput from "./ChatInput"
import { ChatModel, MessageItem, MsgEvents } from "../../../models/chat"
import "./chatOpened.scss"
import { AuthContext } from "../../../contexts/AuthContext"

type Props = {
  chatChosen: ChatModel
  setChatChosen: (chat: ChatModel) => void
  receiverID: number | null
}

const ChatOpened = ({ chatChosen, setChatChosen, receiverID }: Props) => {
  const [chat, setChat] = useState<ChatModel | null>(null)
  const { user } = useContext(AuthContext)

  const receiveMessages = (e: any) => {
    if (chatChosen?.id === e.detail.chat.id) {
      setChat((prevChat) => {
        if (!prevChat) {
          return prevChat
        }

        const newChatHistory = [...prevChat.chatHistory, e.detail.msg]

        return {
          ...prevChat,
          chatHistory: newChatHistory,
        }
      })
    } else if (chatChosen?.id === 0 && receiverID === e.detail.msg.receiverID) {
      const newChat: ChatModel = {
        id: e.detail.chat.id,
        chatName: chatChosen.chatName,
        currUser: user,
        isGroup: e.detail.chat.isGroup,
        chatHistory: [e.detail.msg],
      }
      setChatChosen(newChat)
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`http://localhost:8080/chats/${chatChosen.id}`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "appliction/json" },
          body: JSON.stringify({
            "id": chatChosen.id,
            "isGroup": chatChosen.isGroup,
            "chatName": chatChosen.chatName,
          }),
        })
        const json: ChatModel = await response.json()
        setChat(json)
      } catch (error) {
        console.error("Error fetching chat:", error)
      }
    })()
    document.addEventListener("receive_message", receiveMessages)

    return () => {
      document.removeEventListener("receive_message", receiveMessages)
    }
  }, [chatChosen])

  const send = async () => {
    const inputElement = document.querySelector(".chat-input")
    const content = inputElement?.textContent
    try {
      if (content && chat) {
        let message = {
          id: 0,
          chatID: chat.id,
          type: chat.isGroup ? "group" : "private",
          sender: user,
          content: content,
          sentAT: "",
          receiverID: receiverID ? receiverID : 0,
        } as MessageItem

        const newMessage = new wsEvent(MsgEvents.EventSendMessage, message, chat)
        sendMsg(newMessage)
      }

      inputElement && (inputElement.textContent = "")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="chat-container">
      {chat && (
        <>
          <div className="open-chat-header-wrapper">
            {/* this is broken */}
            <a
              className="open-chat-header"
              href={`/${chat.isGroup ? "group" : "profile"}/${chat.chatName.id}`}
            >
              {chat.chatName.image && chat.chatName.image.Valid ? (
                <img
                  className={`chat-avatar ${chat.isGroup ? "border-radius-5" : "border-radius-20"}`}
                  src={chat.chatName.image.String}
                  alt=""
                />
              ) : (
                <div
                  className={`chat-avatar ${chat.isGroup ? "border-radius-5" : "border-radius-20"}`}
                ></div>
              )}
              <p className="header-20">{chat.chatName.name}</p>
            </a>
          </div>
          <div className="chat-content">
            <ChatHistory chat={chat} />
            <ChatInput send={send} />
          </div>
        </>
      )}
    </div>
  )
}

export default ChatOpened
