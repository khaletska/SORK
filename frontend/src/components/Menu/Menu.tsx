import "./menu.scss"
import { Link } from "react-router-dom"
import Logout from "./Logout"
import SvgSorkLogo from "../assets/SvgSorkLogo"
import SvgHomeLogo from "../assets/SvgHomeLogo"
import SvgChatsLogo from "../assets/SvgChatsLogo"
import SvgCreateLogo from "../assets/SvgCreateLogo"
import SvgCreateGroupLogo from "../assets/SvgCreateGroupLogo"
import SvgProfileLogo from "../assets/SvgProfileLogo"
import { useContext } from "react"
import { AuthContext } from "../../contexts/AuthContext"
import NotificationsPopup from "../Reusable/Popup/Notifications/NotificationsPopup"

const Menu = () => {
  const { user, chatBubbleNumber, setChatBubbleNumber } = useContext(AuthContext)

  const OnChatBtnClick = (e: React.MouseEvent) => {
    setChatsNotificationsSeen(e)
  }

  const setChatsNotificationsSeen = async (e: any) => {
    setChatBubbleNumber(0)
    try {
      await fetch(`http://localhost:8080/chat-notifications/seen`, {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Error during notifications seen", error)
    }
  }

  return (
    <div className="menu-container">
      <div className="menu-top">
        <Link to="/" className="logo">
          <div className="logo-wrapper">
            <SvgSorkLogo />
          </div>
        </Link>
        <Link to="/" className="menu-item">
          <SvgHomeLogo />
          <span className="header-20">Home</span>
        </Link>
        <Link to="/chats/" className="menu-item" onClick={(e) => OnChatBtnClick(e)}>
          <div className="bell-container">
            <SvgChatsLogo />
            {chatBubbleNumber > 0 ? <div className="bubble">{chatBubbleNumber}</div> : null}
          </div>
          <span className="header-20">Chats</span>
        </Link>
        <NotificationsPopup />
        <Link to="/create-post" className="menu-item">
          <SvgCreateLogo />
          <span className="header-20">Create post</span>
        </Link>
        <Link to="/create-group" className="menu-item">
          <SvgCreateGroupLogo />
          <span className="header-20">Create group</span>
        </Link>
        <Link to={`/profile/${user.id}`} className="menu-item">
          <SvgProfileLogo />
          <span className="header-20">Profile</span>
        </Link>
      </div>
      <div className="menu-bottom">
        <Logout></Logout>
      </div>
    </div>
  )
}

export default Menu
