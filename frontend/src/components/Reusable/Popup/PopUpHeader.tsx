import SvgAddFavorite from "../../assets/SvgAddFavorite"
import SvgClose from "../../assets/SvgClose"

type PopUpHeaderProps = {
  title: string
  closePopup: () => void
}

const PopUpHeader = ({ title, closePopup }: PopUpHeaderProps) => {
  return (
    <div className="pop-up-header">
      <div className="popup-title">
        {title === "Close friends" && <SvgAddFavorite />}
        <p className="header-20">{title}</p>
      </div>
      <SvgClose closePopup={closePopup} />
    </div>
  )
}

export default PopUpHeader
