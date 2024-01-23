import { useEffect, useState } from "react"
import { ChatModel } from "../../models/chat"
import ChatOpened from "./ChatOpened/ChatOpened"
import "./chatPageComponent.scss"
import ChatListComponent from "./ChatList/ChatListComponent"
import { useNavigate, useParams } from "react-router-dom"

const ChatsPageComponent = () => {
  const [chatsList, setChatsList] = useState<ChatModel[] | null>(null)
  const [chat, setChat] = useState<ChatModel | null>(null)
  const [receiverID, setReceiverID] = useState<number | null>(null)
  const { reqUserID } = useParams()
  const navigate = useNavigate()

  const fetchChats = async () => {
    try {
      const response = await fetch(`http://localhost:8080/current-user-chats`, {
        method: "GET",
        credentials: "include",
      })

      const json: ChatModel[] = await response.json()
      console.log(json)
      setChatsList(json)
    } catch (error) {
      console.error("Error fetching chats:", error)
    }
  }

  const checkExistingChats = async () => {
    try {
      const response = await fetch(`http://localhost:8080/chats/checkprivatechat/${reqUserID}`, {
        method: "GET",
        credentials: "include",
      })
      const json: ChatModel = await response.json()
      setChat(json)
    } catch (error) {
      console.error("Error fetching chats:", error)
    }
  }

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    if (!reqUserID) {
      setChat(null)
    } else {
      setReceiverID(+reqUserID)
      checkExistingChats()
    }
  }, [reqUserID])

  // useEffect(() => {
  //   if (chat) {
  //     setChatsList((prevChatList) => {
  //       if (!prevChatList) {
  //         return prevChatList
  //       }
  //       let newChatList: ChatModel[] = []
  //       let found = false

  //       for (let i = 0; i < prevChatList.length; i++) {
  //         if (chat.id === prevChatList[i].id) {
  //           found = true
  //         } else if (prevChatList[i].id !== 0) {
  //           newChatList.push(prevChatList[i])
  //         }
  //       }

  //       if (!found) newChatList.unshift(chat)

  //       return newChatList
  //     })
  //   }
  // }, [chat])

  const changeChat = (chat: ChatModel) => {
    const reqChatUserID = chat.chatName.id
    navigate("../chats/" + reqChatUserID)
    setChat(chat)
  }

  if (!chatsList) {
    // TODO: handle the case when we can't load chats for some reason
    return (
      <div className="no-chats">
        <p>Impossible to load chats. Try again later.</p>
      </div>
    )
  }

  return (
    <div className="chat-page-container">
      {chat != null ? (
        <ChatOpened chatChosen={chat} setChatChosen={setChat} receiverID={receiverID} />
      ) : (
        <div className="chat-container">
          <p>Select a chat to start messaging.</p>
        </div>
      )}
      <div className="chat-list-container">
        <p className="chat-header header-20">Chats</p>
        {chatsList.length > 0 ? (
          <ChatListComponent chatsList={chatsList} action={changeChat}></ChatListComponent>
        ) : (
          <div className="no-chats border-top">
            <p>No chats yet. Follow someone or join the group.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatsPageComponent
