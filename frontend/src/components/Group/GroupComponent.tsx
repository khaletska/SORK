import { useState, useEffect, useContext } from "react"
import { Group } from "../../models/group"
import { Event } from "../../models/event"
import { Post } from "../../models/post"
import EventsComponent from "./events/EventsComponent"
import GroupPostsComponent from "./GroupPostsComponent"
import GroupFollowersComponent from "./GroupFollowersComponent"
import CreateEventForm from "./forms/CreateEventForm"
import CreateGroupPostForm from "./forms/CreateGroupPostForm"
import "./group.scss"
import { User } from "../../models/user"
import UserListPopup from "../Reusable/Popup/UserListPopup"
import NonMemberView from "./NonMemberView"
import ErrorPage from "../ErrorPage/ErrorPage";
import { AuthContext } from "../../contexts/AuthContext"
import SvgArrow from "../assets/SvgArrow"
import { Link } from "react-router-dom"

type Props = {
  id: number
}

const GroupComponent = ({ id }: Props) => {
  const [groupData, setGroupData] = useState<Group | undefined>()
  const [eventData, setEventData] = useState<Event[] | undefined>()
  const [postData, setPostData] = useState<Post[] | undefined>()
  const [isEventFormVisible, setIsEventFormVisible] = useState<boolean>(false)
  const [isPostFormVisible, setIsPostFormVisible] = useState<boolean>(false)
  const [usersToInvite, setUsersToInvite] = useState<User[] | undefined>()
  const [statusCode, setStatusCode] = useState<number>(200)
  const { user } = useContext(AuthContext)

  async function fetchUsersToInvite() {
    try {
      const response = await fetch(`http://localhost:8080/group/${id}/users-to-invite`, {
        method: "GET",
        credentials: "include",
      })
      const json = await response.json()
      setUsersToInvite(json)
    } catch (error) {
      console.error("Error fetching list of users to invite to group:", error)
    }
  }

  async function fetchGroup() {
    try {
      const response = await fetch(`http://localhost:8080/group/${id}`, {
        method: "GET",
        credentials: "include",
      })
      if (response.ok) {
        const json = await response.json()
        setGroupData(json)
      } else {
        setStatusCode(response.status)
      }
    } catch (error) {
      setStatusCode(500)
      console.error("Error fetching group data:", error)
    }
  }

  async function fetchEvents() {
    try {
      const response = await fetch(`http://localhost:8080/group/${id}/events`, {
        method: "GET",
        credentials: "include",
      })
      const json = await response.json()
      setEventData(json)
    } catch (error) {
      console.error("Error fetching group data:", error)
    }
  }

  async function fetchPosts() {
    try {
      const response = await fetch(`http://localhost:8080/group/${id}/posts`, {
        method: "GET",
        credentials: "include",
      })

      const json = await response.json()
      setPostData(json)
    } catch (error) {
      console.error("Error fetching group data:", error)
    }
  }


  async function sendUnfollowingRequest() {
    console.log("unfollow")
    try {
      const response = await fetch(`http://localhost:8080/group/${id}/request`, {
        method: "DELETE",
        credentials: "include",
      })
      if (response.ok) {
        // TODO send event (to delete notification)
        window.location.reload()
      } else {
        setStatusCode(response.status)
        return
      }
    } catch (error) {
      console.error("Error sending unfollowing request:", error)
    }
  }

  useEffect(() => {
    fetchUsersToInvite()
    fetchGroup()
    fetchEvents()
    fetchPosts()
  }, [])

  if (statusCode !== 200) return <ErrorPage statusCode={statusCode} />

  if (!groupData) return <ErrorPage statusCode={404} />

  if (groupData.isMember !== 1) {
    return <NonMemberView groupData={groupData}></NonMemberView>
  }

  return (
    <div className="group-page-container">
      <div className="group-header-container">
        {groupData.image.Valid ? (
          <img className="group-header-image" src={groupData.image.String} alt="" />
        ) : (
          <div className="hidden-div"></div>
        )}
        <div>
          <p className="header-40">{groupData.name}</p>
        </div>
      </div>
      <div className="group-flex-items-container">
        <div className="group-middle-container">
          <button
            id="add-event-btn"
            className={`btn-3 header-20 ${isEventFormVisible && "hidden-bottom-border"}`}
            onClick={(e) => setIsEventFormVisible(!isEventFormVisible)}
          >
            Add new event
            <div className={`arrow ${isEventFormVisible ? 'rotate' : ''}`}>
              <SvgArrow />
            </div>
          </button>

          {isEventFormVisible && (
            <CreateEventForm
              onSubmit={fetchEvents}
              groupID={id}
              hideForm={() => setIsEventFormVisible(false)}
            />
          )}
          <EventsComponent eventData={eventData} fetchEventsData={fetchEvents}></EventsComponent>
          <button
            id="add-post-btn"
            className={`btn-3 header-20 ${isPostFormVisible && "hidden-bottom-border"}`}
            onClick={(e) => setIsPostFormVisible(!isPostFormVisible)}
          >
            Add new post
            <div className={`arrow ${isPostFormVisible ? 'rotate' : ''}`}>
              <SvgArrow />
            </div>
          </button>
          {isPostFormVisible && (
            <CreateGroupPostForm
              onSubmit={fetchPosts}
              groupID={id}
              hideForm={() => setIsPostFormVisible(false)}
            />
          )}
          <GroupPostsComponent postData={postData}></GroupPostsComponent>
        </div>
        <div className="group-right-container column-flex-gap-10">
          <div className="group-description-container column-flex-gap-10">
            <p className="header-20">Description</p>
            <p className="text-12">{groupData.description}</p>
          </div>
          <UserListPopup
            title="Invite"
            items={usersToInvite ?? []}
            buttonTitle="Invite"
            buttonTypeClass="btn-1 width-100"
            groupID={id}
            interactions={true}
            onClose={fetchUsersToInvite}
          />
          <Link to={'/chats'}>
            <button className="btn-1 header-20">
              Chat
            </button>
          </Link>
          {groupData.creator.id !== user.id &&
            <button className="btn-1 header-20" onClick={sendUnfollowingRequest}>
              Unfollow
            </button>
          }
          <GroupFollowersComponent id={id}></GroupFollowersComponent>
        </div>
      </div>
    </div>
  )
}

export default GroupComponent
