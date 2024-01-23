
import { useEffect, useState } from "react"
import ImageBox from "../../Reusable/ImageBox/ImageBox";
import './groupForms.scss'
import { MsgEvents } from "../../../models/chat";
import { sendNotification } from "../../../api/chats";
import { User } from "../../../models/user";
import ErrorPage from "../../ErrorPage/ErrorPage";

type Props = {
  groupID: number
  hideForm: () => void
  onSubmit: () => void
}

const CreateEventForm = ({ groupID, hideForm, onSubmit }: Props) => {
  const [eventImage, setEventImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [followers, setFollowersData] = useState<User[] | undefined>();
  const [statusCode, setStatusCode] = useState<number>(200)

  useEffect(() => {
    (async () => {
      const response = await fetch(
        `http://localhost:8080/group/${groupID}/followers`, {
        method: 'GET',
        credentials: 'include'
      }
      )
      if (!response.ok) {
        setStatusCode(response.status)
        return
      }
      const json = await response.json()
      setFollowersData(json)
    })()
  }, [])


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    let title: string = formData.get("title") as string
    let description: string = formData.get("description") as string
    let date: string = formData.get("date") as string
    let time: string = formData.get("time") as string

    try {
      const response = await fetch(`http://localhost:8080/group/${groupID}/create-event`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "appliction/json" },
        body: JSON.stringify({
          image: { string: eventImage, valid: eventImage ? true : false },
          title: title,
          description: description,
          happeningAT: `${date} ${time}`,
        }),
      });

      if (response.ok) {
        const json = await response.json()
        followers?.forEach((follower) => {
          send(e, follower.id, json)
        })
        onSubmit()
        hideForm()
      } else {
        setStatusCode(response.status)
        setError("Something wrong with data or a problem during creating a event. Please try again soon.");
      }
    } catch (err) {
      setError("Something wrong with data or a problem during creating a event. Please try again soon.");
    }
  }

  const send = async (event: React.FormEvent<HTMLFormElement>, receiverID: number, eventID: number) => {
    event.preventDefault();
    console.log(eventID)
    try {
      sendNotification({
        id: 0,
        receiverID: receiverID,
        data: {
          type: 'newEvent',
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
          eventID: eventID, // anyway we don't use it yet
          senderID: 0,
          groupID: groupID,
          postID: 0,
        },
        isRead: false,
        timestamp: '',
      }, MsgEvents.EventSendNotification);
    } catch (error) {
      console.error(error)
    }
  }
  if (statusCode !== 200) return <ErrorPage statusCode={statusCode} />

  return (
    <form onSubmit={handleSubmit} id="add-event-form" className="group-form-content">
      <div className="group-form-field">
        Image:
        <ImageBox image={eventImage} setImageSrc={setEventImageSrc}></ImageBox>
      </div>
      <div className="group-form-field">
        <label htmlFor="title" className="header-20">Title:</label>
        <input
          type="text"
          name="title"
          className="input-white text-clip-elipsis text-12"
          placeholder="Write title"
          minLength={2}
          maxLength={50}
          required
        />
      </div>
      <div className="group-form-field">
        <label htmlFor="description" className="header-20">
          Description:
        </label>
        <textarea
          name="description"
          className="input-white text-clip-elipsis text-12"
          placeholder="Write description"
          minLength={2}
          maxLength={2000}
          required
        />
      </div>
      <div className="group-form-field">
        <label htmlFor="date" className="header-20">Date:</label>
        <input
          type="date"
          name="date"
          className="input-white text-12"
          min={new Date().toISOString().split('T')[0]}
          placeholder="dd-mm-yyyy"
          required
        />
      </div>
      <div className="group-form-field">
        <label htmlFor="time" className="header-20">Time:</label>
        <input
          type="time"
          name="time"
          className="input-white text-12"
          required />
      </div>
      {error && (
        <div className="error text-12">
          <span>{error}</span>
        </div>
      )}
      <button className="btn-1" type="submit">Add event</button>
    </form>
  )
}

export default CreateEventForm