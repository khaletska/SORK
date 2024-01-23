import { useParams } from "react-router-dom"
import ProfileInfo from "./ProfileInfo"
import ProfileGroups from "./ProfileGroups"
import ProfilePosts from "./ProfilePosts"
import "./profile.scss"
import { useContext, useEffect, useState } from "react"
import { User } from "../../models/user"
import { AuthContext } from "../../contexts/AuthContext"
import { Group } from "../../models/group"
import { Post } from "../../models/post"
import ErrorPage from "../ErrorPage/ErrorPage"

type ProfileData = {
  fetchUser: User
  groups: Group[]
  posts: Post[]
  connection: string
}

export enum ConnectionType {
  noName = "not_friend",
  friends = "friends",
  closeFriends = "close_friends",
  currentUser = "currUser",
  pending = "pending"
}

const ProfileRoute = () => {
  const { id } = useParams()
  const [connection, setUsersConnection] = useState<string | null>(ConnectionType.currentUser)
  const { user } = useContext(AuthContext)
  // profile data
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [fetchUser, setFetchUser] = useState<User | null>(null)
  const [groups, setGroups] = useState<Group[] | null>(null)
  const [statusCode, setStatusCode] = useState<number>(200)

  const getUserInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8080/profile/${id}`, {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const json: ProfileData = await response.json()
        setPosts(json.posts)
        setFetchUser(json.fetchUser)
        setGroups(json.groups)
        setUsersConnection(json.connection)
      } else {
        setStatusCode(response.status)
      }
    } catch (error) {
      setStatusCode(500)
      console.error("Error fetching profile:", error)
    }
  }

  useEffect(() => {
    getUserInfo()
  }, [id])

  if (statusCode !== 200) return <ErrorPage statusCode={statusCode} />

  return (
    <>
      {user ? (
        <>
          {!fetchUser?.isPublic && (connection === ConnectionType.noName || connection === ConnectionType.pending) ? (
            <>
              <div className="profile-wrapper with-privacy">
                <ProfileInfo
                  connection={connection}
                  fetchUser={fetchUser}
                  getUserInfo={getUserInfo}
                  setUsersConnection={setUsersConnection}
                />
                <div className="privacy-wrapper border-top">
                  <p className="header-20">This account is private</p>
                  <p className="text-12 text-gray">
                    Follow this account to see their photos and videos.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="profile-wrapper">
                <ProfileInfo
                  connection={connection}
                  fetchUser={fetchUser}
                  getUserInfo={getUserInfo}
                  setUsersConnection={setUsersConnection}
                />
                <ProfileGroups groups={groups} />
                <ProfilePosts posts={posts} />
              </div>
            </>
          )}
        </>
      ) : (
        <></>
      )}
    </>
  )
}

export default ProfileRoute
