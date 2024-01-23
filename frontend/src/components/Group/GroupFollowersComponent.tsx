import { useState, useEffect } from "react"
import { User } from "../../models/user"
import UserItem from "../Reusable/UserItem/UserItem"

type Props = {
    id: number
}

const GroupFollowersComponent = ({id}:Props) => {
    const [followersData, setFollowersData]=useState<User[]|undefined>()

    useEffect(() => {
      (async() => {
        try {
          const response = await fetch(
              `http://localhost:8080/group/${id}/followers`, {
                method: 'GET',
                credentials: 'include'
            }
          )
  
          const json: User[] = await response.json()
          setFollowersData(json)
        } catch (error) {
          console.error('Error fetching group followers:', error)
        }
      })()
    },[])

    if (!followersData) {

        return (
            <div>
                <p>Unable to load followers. Try again later.</p>
            </div>
        )
    }

    return (
        <div className="group-followers-container">
          <p className="header-20 followers-title">Followers</p>
          {followersData.length > 0 ? (
            followersData.map((follower) => (
              <div className="group-member" key={`member-${follower.id}`}>
              <UserItem id={follower.id} image={follower.avatar} authorName={ `${follower.firstName} ${follower.lastName}`} isSmallText={true}></UserItem>
              </div>
            ))
          ) : (
            <div className="no-followers">
              {/* only possible case if creator of the group has been deleted */}
              <p>No followers yet. Be the first!</p>
            </div>
          )}
        </div>
    )
}

export default GroupFollowersComponent