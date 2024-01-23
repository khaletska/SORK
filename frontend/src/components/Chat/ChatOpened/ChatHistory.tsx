import Message from './Message'
import { ChatModel } from '../../../models/chat'
import './chatHistory.scss'
import { useEffect, useRef, useState } from 'react'

type Props = {
  chat: ChatModel
}

const ChatHistory = ({ chat }: Props) => {
    const chatHistoryRef = useRef<HTMLDivElement>(null)
    const [isMessageNotSentErrorVisible, setErrorVisible] = useState(false);

  useEffect(() => {
    // Scroll chat history to the bottom when chat updates
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight
    }
  }, [chat])

    document.addEventListener("ChatSendingError", (e: any) => {
        console.log('Error when sending message')
        setErrorVisible(true)
      })

    return (
        <div className='chat-history' ref={chatHistoryRef}>
            {chat ? (
                chat.chatHistory.map((message) => (
                    <Message
                        key={`message-${message.id}`}
                        message={message}
                        isAlignRight={message.sender.id === chat.currUser.id}
                        isGroup={chat.isGroup} />
                ))
            ) : (
                <div>No messages found.</div>
            )}
            {isMessageNotSentErrorVisible &&(<div className='red-error-msg'> Error sending your message!</div>)}
        </div>
    )
}

export default ChatHistory

