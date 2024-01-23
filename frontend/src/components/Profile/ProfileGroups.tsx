import { useEffect, useState } from "react"
import { Group } from "../../models/group"
import "./profile.scss"
import "./horizontalSlider.scss"
import { ScrollingCarousel } from "@trendyol-js/react-carousel"
import CreateGroupSlider from "../Reusable/GroupSlider/GroupSlider"

type Props = {
  groups: Group[] | null
}

const ProfileGroups = ({  groups }: Props) => {
  if (!groups || groups.length === 0) {
    return <div className="hidden-div"></div>
  }

  return (
    <div className="user-groups-wrapper">
      <p className="header-20 border-top">Groups</p>
      <div className="groups-list">
        <ScrollingCarousel>{groups.map(CreateGroupSlider)}</ScrollingCarousel>
      </div>
    </div>
  )
}

export default ProfileGroups
