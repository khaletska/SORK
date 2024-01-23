import "./chatInput.scss"
import SvgMessageIcon from "../../assets/SvgMessageIcon"
import SvgMessageSendIcon from "../../assets/SvgMessageSendIcon"
import React, { useEffect, useState, useRef } from "react"
import EmojisContainer from "../../Post/Emojis"

type Props = {
    send: (event: any) => void
}

const ChatInput = ({ send }: Props) => {
    const [input, setInput] = useState("");
    const [rows, setRows] = useState(1);
    const emojiRef = useRef<any>(null)
    const textareaRef = React.createRef<HTMLTextAreaElement>()

    useEffect(() => {
        let newlineCount = (input.match(/\n/g) || []).length;
        setRows(Math.min(newlineCount + 1, 7));
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && e.ctrlKey) {
            send(e)
            setInput("")
        }
    }

    const OnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
    }

    const sendOnclick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        send(e)
        setInput("")
    }

    var openEmojiPopup = () => {
        if (emojiRef.current) {
            emojiRef.current.toggleEmojisContainer()
        }
    }

    const handleInsertEmoji = (emoji: string) => {
        const textarea = textareaRef.current
        if (textarea) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const currentText = textarea.value
            const updatedText =
                currentText.substring(0, start) + emoji + currentText.substring(end)

            // update the textarea value
            textarea.value = updatedText
            const event = new Event("input", { bubbles: true })
            textarea.dispatchEvent(event)
            textarea.selectionStart = start + emoji.length
            textarea.selectionEnd = start + emoji.length
            textarea.focus()
        }
    }

    return (
        <div className='new-message-container'>
            <EmojisContainer
                ref={emojiRef}
                insertEmoji={handleInsertEmoji}
            />
            <div className='new-message'>
                {/* TODO add limit max 7 lines */}
                <textarea className="input-white chat-input text-12"
                    ref={textareaRef}
                    role="textbox"
                    rows={rows}
                    onChange={OnChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a message here and press Ctrl+Enter to send"
                    value={input}>
                </textarea>
                <div className='new-message-icon chat-add-emoji' onClick={openEmojiPopup}>
                    <SvgMessageIcon />
                </div>
                <div className='new-message-icon chat-send' onClick={sendOnclick}>
                    <SvgMessageSendIcon />
                </div>
            </div>
        </div>
    )
}

export default ChatInput
