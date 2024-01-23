import React from "react"

type Props = {
  closePopup: () => void
}

const SvgClose = ({ closePopup }: Props) => {
  return (
    <svg
      className="close"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
      onClick={closePopup}
    >
      <path
        d="M18 6.88818L6 18.8882"
        stroke="#222222"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 6.88818L18 18.8882"
        stroke="#222222"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default SvgClose
