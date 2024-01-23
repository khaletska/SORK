import React, { useEffect, useState, useRef, useContext } from "react"
import { Comment } from "../../models/comment"
import "./comments.scss"
import UserItem from "../Reusable/UserItem/UserItem"
import EmojisContainer from "./Emojis"
import { TextError } from "../../models/error"
import { NullStr } from "../../models/nullable"
import SvgUploadPictureLogo from "../assets/SvgUploadPictureLogo"
import SvgCommentSend from "../assets/SvgCommentSend"
import { Post } from "../../models/post"
import { MsgEvents } from "../../models/chat"
import { sendNotification } from "../../api/chats"
import { AuthContext } from "../../contexts/AuthContext"
import SvgAddEmojiLogo from "../assets/SvgAddEmojiLogo"

type Props = {
  postID: string
}

const CommentsComponent = ({ postID }: Props) => {
  const emojiRef = useRef<any>(null)
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [error, setError] = useState<TextError>({ isError: false, text: "" }) // TODO
  const [statusCode, setStatusCode] = useState<number>(200)
  const [comment, setComment] = useState("")
  const { user } = useContext(AuthContext)
  const [isSizeErrorVisible, setSizeErrorVisible] = useState(false);
  const textareaRef = React.createRef<HTMLTextAreaElement>()


  const [rows, setRows] = useState(1) // Initial number of rows

  const [image, setImageSrc] = useState("")
  const maxImageSize = 0.2 * 1024 * 1024 //5Mb

  const maxCharacters = 280

  useEffect(() => {
    let newlineCount = (comment.match(/\n/g) || []).length

    setRows(Math.min(newlineCount + 1, 7))
  }, [comment])

  const [post, setPost] = useState<Post | null>(null)

  useEffect(() => {
    fetch(`http://localhost:8080/post/${postID}`, {
      method: 'GET',
      credentials: 'include'
    })
      .then((response) => {
        if (!response.ok) {
          setStatusCode(response.status)
          return
        }
        return response.json()
      })
      .then((data: Post) => setPost(data))
      .catch((error) => {
        console.error('Error:', error);
      });
  }, []);

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


  const validateFileSize = (file: File) => {
    if (file.size > maxImageSize) {
      setSizeErrorVisible(true);
      setImageSrc("")
      return false
    }
    setSizeErrorVisible(false);
    return true
  }

  const imageHandler = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      if (!validateFileSize(e.target.files[0])) {
        // console.log("file too large")
        return
      }

      const droppedFile = e.currentTarget.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        setImageSrc(String(event.target?.result))
      }
      reader.readAsDataURL(droppedFile)
    }
  }

  let sqlNullString: NullStr = {
    Valid: image !== undefined && image !== "",
    String: image !== undefined && image !== "" ? image : "",
  }

  const submitComment = async (e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const content = comment;
    setComment("");
    setImageSrc("")

    console.log("submit", content, image);

    try {
      const response = await fetch(`http://localhost:8080/post/${postID}/comments/new`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "appliction/json" },
        body: JSON.stringify({
          "postID": +postID,
          "content": content,
          "image": sqlNullString,
        }),
      })

      console.log("res", response)

      if (response.ok) {
        send(e)
        const data = await response.json();
        if (data.success) {
          (async () => {
            try {
              const response = await fetch(`http://localhost:8080/post/${postID}/comments`, {
                method: "GET",
                credentials: "include",
              })
              const json: Comment[] = await response.json()
              setComments(json)
            } catch (error) {
              console.error("Error fetching comments:", error)
            }
          })()
        } else {
          setError({
            isError: true,
            text: data.error,
          })
        }
      } else {
        console.log("Error:", response)
      }
    } catch (error) {
      console.error("Request failed with status:", error)
    }
  }

  const send = async (event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault();
    try {
      sendNotification({
        id: 0,
        receiverID: post ? post.author.id : -1,
        data: {
          type: 'comment',
          leftEntity: {
            id: 0,
            name: '',
            image: { String: '', Valid: false }
          },
          rightEntity: {
            id: 0,
            name: '',
            image: { String: '', Valid: false }
          },
          chatID: 0,
          eventID: 0,
          senderID: user.id,
          groupID: 0,
          postID: post ? post.id : -1,
        },
        isRead: false,
        timestamp: '',
      }, MsgEvents.EventSendNotification);
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`http://localhost:8080/post/${postID}/comments`, {
          method: "GET",
          credentials: "include",
        })
        const json: Comment[] = await response.json()
        setComments(json)
      } catch (error) {
        console.error("Error fetching comments:", error)
      }
    })()
  }, [])

  if (!comments || statusCode !== 200) {
    return <></>
  }

  const HandleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      submitComment(e)
    }
  }

  const OnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxCharacters) {
      setComment(e.target.value)
    } else {
      //max char limit reached, don't do anything or optionally send a notification to the user
    }
  }

  return (
    <div className="comments-outer-container">
      {comments.length > 0 ? (
        <div className="comments-container">
          <p className="comments-header header-20">Comments</p>
          {comments.map((comment) => (
            <div className="comment-box" key={`comment-${comment.id}`} id={`comment-${comment.id}`}>
              {comment.image !== null && comment.image.Valid && (
                <img className="comment-img" src={comment.image.String} alt="" />
              )}
              <div className="comment-itself">
                <p className="comment-date text-12">{comment.createdAT}</p>
                <UserItem
                  id={comment.author.id}
                  authorName={`${comment.author.firstName} ${comment.author.lastName}`}
                  image={comment.author.avatar}
                />
                <pre className="comment-content text-12">{comment.content}</pre>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-comments">
          <p>No comments yet. Write your own!</p>
        </div>
      )}
      {isSizeErrorVisible && (
        <div className="Image-size-error-popup">
          The file is too big. Please choose a smaller file.
        </div>
      )}
      <EmojisContainer
        ref={emojiRef}
        insertEmoji={handleInsertEmoji}
      />
      <div className="new-comment">
        <label htmlFor="image-upload" className="new-comment-icon comment-add-img">
          {image === "" ? (
            <>
              <SvgUploadPictureLogo />
            </>
          ) : (
            <img className="uploaded-comment-image" src={image} />

          )}
          <input
            id="image-upload"
            type="file"
            accept="image/jpeg, image/jpg, image/png, image/gif"
            name="attachment"
            style={{ display: "none" }}
            onChange={(e) => imageHandler(e)}
          />

        </label>
        <div className='new-comment-icon comment-add-emoji' onClick={openEmojiPopup}>
          <SvgAddEmojiLogo />
        </div>
        <textarea
          ref={textareaRef}
          onChange={OnChange}
          value={comment}
          onKeyDown={HandleKeyDown}
          className="input-white comment-input text-12"
          placeholder="Add your comment and press Ctrl+Enter to send"
          rows={rows}
        ></textarea>
        <div className="new-comment-icon comment-send" onClick={(e) => submitComment(e)}>
          <SvgCommentSend />
        </div>
      </div>
    </div>
  )
}
export default CommentsComponent
