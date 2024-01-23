import { useState } from "react"
import "./imageBox.scss"
import SvgUploadFile from "../../assets/SvgUploadFile"

type Props = {
  image: string | null
  setImageSrc: (value: string | null) => void
}

const ImageBox = ({ image, setImageSrc }: Props) => {
  const [dragActive, setDragActive] = useState(false)
  const maxImageSize = 5 * 1024 * 1024 //5Mb
  const [isSizeErrorVisible, setSizeErrorVisible] = useState(false);

  const validateFileSize = (file: File) => {
    if (file.size > maxImageSize) {
      setSizeErrorVisible(true);
      setImageSrc(null)
      return false
    }
    setSizeErrorVisible(false);
    return true
  }

  const imageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDragActive(false)
    if (e.target.files && e.target.files[0]) {
      if (!validateFileSize(e.target.files[0])) {
        console.log("file too large")
        return
      }
      const droppedFile = e.target.files[0]
      const reader = new FileReader()
      reader.readAsDataURL(droppedFile)
      reader.onload = (event) => {
        const imageSrc: string | null = reader.result ? reader.result as string : null
        setImageSrc(imageSrc)
      }
    }
  }

  const dropHandler = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (!validateFileSize(e.dataTransfer.files[0])) {

        console.log("file too large")
        return
      }
      const droppedFile = e.dataTransfer.files[0]
      const reader = new FileReader()
      reader.readAsDataURL(droppedFile)
      reader.onload = (event) => {
        const imageSrc: string | null = reader.result ? reader.result as string : null
        setImageSrc(imageSrc)
      }
    }
  }

  const dragHandler = function (e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  return (
    <>
      <label
        htmlFor="image-upload"
        id="image-box"
        className={dragActive ? "drag-active" : ""}
        onDragEnter={(e) => dragHandler(e)}
        onDragLeave={(e) => dragHandler(e)}
        onDragOver={(e) => dragHandler(e)}
        onDrop={(e) => dropHandler(e)}
      >
        {typeof image !== "string" ? (
          <>
            <SvgUploadFile />
            <span className="text-12">Drag file here to upload</span>
            <span className="text-gray text-12">Alternatively, you can select file by</span>
            <span className="text-12">Clicking here</span>
          </>
        ) : (
          <img className="uploaded-image" src={image} alt="" />
        )}
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/jpeg, image/jpg, image/png, image/gif"
        name="attachment"
        onChange={(e) => imageHandler(e)}
      />
      {isSizeErrorVisible && (
        <div className="error text-12">
          The file is too big. Please choose a smaller file.
        </div>
      )}
    </>
  )
}

export default ImageBox
